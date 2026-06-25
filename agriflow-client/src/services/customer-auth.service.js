import { API } from "@/constants/api";
import { get, post, put } from "./api";

const customerAuthService = {
  login(email, password) {
    return post(API.CUSTOMER_AUTH.LOGIN, { email, password });
  },
  register(data) {
    return post(API.CUSTOMER_AUTH.REGISTER, data);
  },
  logout() {
    return post(API.CUSTOMER_AUTH.LOGOUT);
  },
  getProfile() {
    return get(API.CUSTOMER_AUTH.PROFILE);
  },
  updateProfile(data) {
    return put(API.CUSTOMER_AUTH.UPDATE_PROFILE, data);
  },
  changePassword(data) {
    return post(API.CUSTOMER_AUTH.CHANGE_PASSWORD, data);
  },
};

export default customerAuthService;
