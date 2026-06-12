// services/productApi.ts
import axios from "axios";

export const getProducts = async () => {
  const res = await axios.get("https://fakestoreapi.com/products");
  return res.data;
};