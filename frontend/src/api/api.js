import { client } from "@/utils/helper";

export const fetchCategory = async () => {
  try {
    const response = await client.get("/category");

    return response.data;
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || error.message,
    };
  }
};

export const fetchCategoryById = async (id) => {
  try {
    const response = await client.get(`category/${id}`);
    if (response.data.success) {
      return response.data;
    }
  } catch (error) {
    return {
      data: [],
      success: false,
    };
  }
};

export const fetchRoom = async () => {
  try {
    const response = await client.get("/room-type");

    return response.data;
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || error.message,
    };
  }
};

export const fetchRoomById = async (id) => {
  try {
    const response = await client.get(`room-type/${id}`);
    if (response.data.success) {
      return response.data;
    }
  } catch (error) {
    return {
      data: [],
      success: false,
    };
  }
};

export const fetchProduct = async ({
  category,
  search,
  color,
  material,
  room,
  stock,
  minPrice,
  maxPrice,
  page,
  bestSeller,
  newArrival,
  sortFilter,
  limit,
} = {}) => {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (color) params.append("color", color);
    if (material) params.append("material", material);

    if (category != null) {
      params.append("category", category);
    }

    if (room != null) {
      params.append("room", room);
    }

    if (stock != null) {
      params.append("stock", stock);
    }

    if (minPrice != null) {
      params.append("minprice", minPrice);
    }

    if (maxPrice != null) {
      params.append("maxprice", maxPrice);
    }

    if (page != null) {
      params.append("page", page);
    }

    if (bestSeller != null) {
      params.append("bestseller", bestSeller);
    }

    if (newArrival != null) {
      params.append("newarrival", newArrival);
    }

    if (sortFilter != null) {
      params.append("sortFilter", sortFilter);
    }

    if (limit != null) {
      params.append("limit", limit);
    }

    const response = await client.get(`/product?${params.toString()}`);

    return response.data;
  } catch (error) {
    return {
      success: false,
      data: [],
      total: 0,
      pages: 1,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const fetchProductById = async (id) => {
  try {
    const response = await client.get(`product/${id}`);
    if (response.data.success) {
      return response.data;
    }
  } catch (error) {
    return {
      data: {},
      success: false,
    };
  }
};
