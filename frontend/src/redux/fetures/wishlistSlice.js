import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { client } from "@/utils/helper";
const initialState = {
  userId: null,
  items: [],
  status: "idle",
  error: "",
  pending: {},
  completedOrders: {},
};
const slice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    reset: () => initialState,
    loading(state, { payload }) {
      if (state.userId !== payload) Object.assign(state, initialState);
      state.userId = payload;
      state.status = "loading";
      state.error = "";
    },
    loaded(state, { payload }) {
      state.items = payload;
      state.status = "ready";
    },
    failed(state, { payload }) {
      state.status = "error";
      state.error = payload;
    },
    pending(state, { payload }) {
      state.pending[payload.id] = payload.busy;
    },
    orderCompleted(state, { payload }) {
      state.completedOrders[payload] = true;
    },
    removed(state, { payload }) {
      state.items = state.items.filter((item) => item._id !== payload);
    },
    restored(state, { payload }) {
      if (!state.items.some((item) => item._id === payload._id))
        state.items.push(payload);
    },
  },
});
export const loadWishlist =
  (force = false) =>
  async (dispatch, getState) => {
    const userId = getState().cart.user?._id;
    const state = getState().wishlist;
    if (!userId) {
      dispatch(slice.actions.reset());
      return;
    }
    if (
      state.userId === userId &&
      (state.status === "loading" || (!force && state.status !== "idle"))
    )
      return;
    dispatch(slice.actions.loading(userId));
    try {
      const response = await client.get("commerce/wishlist");
      if (
        getState().cart.user?._id === userId &&
        getState().wishlist.userId === userId
      )
        dispatch(
          slice.actions.loaded(
            Array.isArray(response.data.data)
              ? response.data.data.filter((item) => item?._id)
              : [],
          ),
        );
    } catch (error) {
      if (getState().cart.user?._id === userId)
        dispatch(
          slice.actions.failed(
            error.response?.data?.message ||
              "Unable to load your wishlist. Please try again.",
          ),
        );
    }
  };
export const toggleWishlist = (id) => async (dispatch, getState) => {
  const userId = getState().cart.user?._id;
  if (!userId) throw new Error("Please sign in to save your favourites.");
  if (Object.values(getState().wishlist.pending).some(Boolean)) return;
  const item = getState().wishlist.items.find((product) => product._id === id);
  dispatch(slice.actions.pending({ id, busy: true }));
  if (item) dispatch(slice.actions.removed(id));
  try {
    if (item) await client.delete(`commerce/wishlist/${id}`);
    else await client.put(`commerce/wishlist/${id}`);
    if (!item && getState().cart.user?._id === userId)
      await dispatch(loadWishlist(true));
  } catch (error) {
    if (item && getState().cart.user?._id === userId)
      dispatch(slice.actions.restored(item));
    throw error;
  } finally {
    if (getState().wishlist.userId === userId)
      dispatch(slice.actions.pending({ id, busy: false }));
  }
};
export const isSuccessfulWishlistOrder = (order) =>
  [
    "placed",
    "confirmed",
    "packed",
    "shipped",
    "out_for_delivery",
    "delivered",
  ].includes(order?.orderStatus) &&
  (order?.paymentMethod === "cod" || order?.paymentStatus === "paid");
export const removeOrderedWishlistItems =
  (orderOrId) => async (dispatch, getState) => {
    const userId = getState().cart.user?._id;
    if (!userId) return;
    try {
      const order =
        typeof orderOrId === "string"
          ? (await client.get(`order/${orderOrId}`)).data.data
          : orderOrId;
      if (
        !isSuccessfulWishlistOrder(order) ||
        getState().cart.user?._id !== userId ||
        getState().wishlist.completedOrders[order._id]
      )
        return;
      const ids = [
        ...new Set(
          (order.items || [])
            .map((item) => String(item.product_id?._id || item.product_id))
            .filter((id) => id !== "undefined"),
        ),
      ];
      const previous = getState().wishlist.items.filter((item) =>
        ids.includes(String(item._id)),
      );
      ids.forEach((id) => dispatch(slice.actions.removed(id)));
      const results = await Promise.allSettled(
        ids.map((id) => client.delete(`commerce/wishlist/${id}`)),
      );
      if (getState().cart.user?._id !== userId) return;
      let failed = false;
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          failed = true;
          const item = previous.find((item) => String(item._id) === ids[index]);
          if (item) dispatch(slice.actions.restored(item));
        }
      });
      if (failed)
        toast.error(
          "Your order succeeded, but wishlist cleanup failed. Refresh the order to retry.",
        );
      else dispatch(slice.actions.orderCompleted(order._id));
    } catch {
      toast.error(
        "Your order succeeded, but your wishlist could not be refreshed.",
      );
    }
  };
export default slice.reducer;
