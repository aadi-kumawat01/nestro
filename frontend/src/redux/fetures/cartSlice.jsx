import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { client } from "@/utils/helper";
import { playCartSound } from "@/utils/sound";

const initialState = {
  item: [],
  original_total: 0,
  final_total: 0,
  revision: 0,
  user: null,
  ready: false,
  busy: false,
  pending: {},
  error: "",
};
function normalizeItem(item) {
  const p = item?.productId || item || {};

  const originalCandidate = Number(p.originalPrice ?? p.price);

  const saleCandidate = Number(p.salePrice);

  const validOriginal =
    Number.isFinite(originalCandidate) && originalCandidate >= 0
      ? originalCandidate
      : null;

  const validSale =
    Number.isFinite(saleCandidate) && saleCandidate >= 0 ? saleCandidate : null;

  const originalPrice =
    validOriginal !== null && validOriginal > 0
      ? validOriginal
      : validSale !== null
        ? validSale
        : 0;

  const salePrice =
    validSale !== null && validSale > 0
      ? originalPrice > 0
        ? Math.min(validSale, originalPrice)
        : validSale
      : originalPrice;

  const quantityNumber = Number(item?.quantity);

  const quantity =
    Number.isInteger(quantityNumber) && quantityNumber > 0 ? quantityNumber : 1;

  return {
    _id: p._id,
    name: p.title || p.name,
    slug: p.slug,

    originalPrice,
    salePrice,

    thumbnail: p.thumbnail,

    category:
      p.category?.name || (typeof p.category === "string" ? p.category : ""),

    quantity,

    stock: p.stock !== false,
    stockQuantity: p.stockQuantity,
    status: p.status !== false,
  };
}
export const isOutOfStock = (product) =>
  product.stock === false || Number(product.stockQuantity) <= 0;
export const cannotCheckout = (cart) =>
  !cart.ready ||
  cart.busy ||
  !cart.item.length ||
  Object.keys(cart.pending || {}).length > 0 ||
  cart.item.some(
    (item) => isOutOfStock(item) || item.quantity > Number(item.stockQuantity),
  );
function totals(state) {
  state.original_total = state.item.reduce(
    (sum, item) => sum + item.originalPrice * item.quantity,
    0,
  );
  state.final_total = state.item.reduce(
    (sum, item) => sum + item.salePrice * item.quantity,
    0,
  );
}
const slice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    snapshot(state, { payload }) {
      state.item = (payload.items || [])
        .map(normalizeItem)
        .filter((item) => item._id);
      if (payload.settledId) delete state.pending[payload.settledId];
      for (const [id, pending] of Object.entries(state.pending)) {
        state.item = state.item.filter((item) => item._id !== id);
        if (pending.next) state.item.push(pending.next);
      }
      totals(state);
      state.revision = payload.revision || 0;
      if ("user" in payload) state.user = payload.user;
      state.ready = true;
      state.error = "";
    },
    optimistic(state, { payload }) {
      state.pending[payload.id] = {
        previous: state.item.find((item) => item._id === payload.id),
        next: payload.next,
      };
      state.item = state.item.filter((item) => item._id !== payload.id);
      if (payload.next) state.item.push(payload.next);
      totals(state);
    },
    rollback(state, { payload: id }) {
      const pending = state.pending[id];
      if (!pending) return;
      state.item = state.item.filter((item) => item._id !== id);
      if (pending.previous) state.item.push(pending.previous);
      delete state.pending[id];
      totals(state);
    },
    busy(state, action) {
      state.busy = action.payload;
    },
    error(state, action) {
      state.error = action.payload;
    },
    reset() {
      return { ...initialState, ready: true };
    },
  },
});
const { snapshot, optimistic, rollback, busy, error, reset } = slice.actions;
const guestKey = "nestro:guest-cart:v2";
let queue = Promise.resolve();
let generation = 0;
function readGuest() {
  try {
    const raw = JSON.parse(localStorage.getItem(guestKey) || "null");
    return raw && Array.isArray(raw.items)
      ? raw
      : { id: crypto.randomUUID(), items: [] };
  } catch {
    return { id: crypto.randomUUID(), items: [] };
  }
}
function saveGuest(guest) {
  localStorage.setItem(guestKey, JSON.stringify(guest));
}
export const bootstrapCart = () => async (dispatch) => {
  await queue;
  const current = ++generation;
  // Make the guest cart interactive immediately. Authentication may be slow
  // (for example, while a hosted API wakes up) and should not block shopping.
  const initialGuest = readGuest();
  saveGuest(initialGuest);
  dispatch(snapshot({ items: initialGuest.items, user: null }));
  try {
    let user = null;
    try {
      user = (await client.get("user/get-me")).data.user;
    } catch (e) {
      if (e.response?.status !== 401) throw e;
    }
    if (current !== generation) return;
    // Preserve ambiguous legacy data as a backup, never merge another account's cart.
    const legacy = localStorage.getItem("cart");
    if (legacy) {
      localStorage.setItem("nestro:legacy-cart-backup", legacy);
      localStorage.removeItem("cart");
    }
    // Re-read after the auth request so items added while it was pending are
    // included in either the guest snapshot or the signed-in merge.
    const guest = readGuest();
    if (user) {
      dispatch(busy(true));
      let result;
      if (guest.items.length)
        result = await client.post("cart/sync", {
          mergeId: guest.id,
          items: guest.items.map((item) => ({
            productId: item._id,
            quantity: item.quantity,
          })),
        });
      else result = await client.get("cart");
      if (current !== generation) return;
      localStorage.removeItem(guestKey);
      dispatch(snapshot({ ...result.data.cart, user }));
    } else {
      saveGuest(guest);
      dispatch(snapshot({ items: guest.items, user: null }));
    }
  } catch (e) {
    if (current === generation)
      dispatch(
        error(
          e.response?.data?.message ||
            "Unable to load your cart. Please retry.",
        ),
      );
  } finally {
    if (current === generation) dispatch(busy(false));
  }
};
export const refreshCart = () => async (dispatch, getState) => {
  await queue;
  if (!getState().cart.user) return;
  const result = await client.get("cart");
  dispatch(snapshot(result.data.cart));
  return getState().cart;
};
function mutate(product, operation) {
  return (dispatch, getState) => {
    const current = generation;
    const state = getState().cart;
    const id = typeof product === "string" ? product : product._id;
    const existing = state.item.find((item) => item._id === id);
    const source = typeof product === "object" ? product : existing;
    let quantity;
    try {
      if (!state.ready || state.busy)
        throw new Error("Please wait for your cart to load");
      if (state.pending[id]) throw new Error("This item is still updating");
      quantity =
        operation === "remove"
          ? 0
          : operation === "decrease"
            ? Math.max(0, (existing?.quantity || 0) - 1)
            : (existing?.quantity || 0) +
              (typeof product === "object" ? (product.quantity ?? 1) : 1);
      if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99)
        throw new Error("Choose a quantity between 1 and 99");
      if (
        operation === "add" &&
        (!source ||
          isOutOfStock(source) ||
          (existing && isOutOfStock(existing)))
      )
        throw new Error("Out of Stock");
      if (
        operation === "add" &&
        (quantity > Number(source.stockQuantity) ||
          (existing && quantity > Number(existing.stockQuantity)))
      )
        throw new Error("Requested quantity exceeds available stock");
    } catch (e) {
      toast.error(e.message);
      return Promise.reject(e);
    }
    const next = quantity
      ? { ...normalizeItem(source || existing), quantity }
      : null;
    dispatch(optimistic({ id, next }));
    const toastId =
      operation === "add" && !existing
        ? toast.success("Added to cart")
        : undefined;
    if (operation === "add") playCartSound();
    const work = queue
      .then(async () => {
        if (current !== generation) return;
        if (getState().cart.user) {
          const response = await client.put(`cart/items/${id}`, {
            quantity,
            revision: getState().cart.revision,
          });
          if (current === generation)
            dispatch(snapshot({ ...response.data.cart, settledId: id }));
        } else {
          const guest = readGuest();
          const items = guest.items.filter((item) => item._id !== id);
          if (next) items.push(next);
          saveGuest({ ...guest, items });
          if (current === generation)
            dispatch(snapshot({ items, settledId: id }));
        }
      })
      .catch(async (e) => {
        if (current === generation) {
          dispatch(rollback(id));
          if (e.response?.status === 409 && getState().cart.user) {
            try {
              const result = await client.get("cart");
              if (current === generation) dispatch(snapshot(result.data.cart));
            } catch {
              /* Keep rolled-back quantity if refresh fails. */
            }
          }
          toast.error(
            e.response?.data?.message || e.message,
            toastId === undefined ? undefined : { id: toastId },
          );
        }
        throw e;
      });
    queue = work.catch(() => {});
    return work;
  };
}
export const addToCart = (product) => mutate(product, "add");
export const increaseQuantity = (id) => mutate(id, "add");
export const decreaseQuantity = (id) => mutate(id, "decrease");
export const removeFromCart = (id) => mutate(id, "remove");
export const clearSession = () => (dispatch) => {
  generation++;
  localStorage.removeItem(guestKey);
  dispatch(reset());
};
export default slice.reducer;
