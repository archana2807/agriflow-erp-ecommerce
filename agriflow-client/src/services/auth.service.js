import { API } from "@/constants/api";
import { get, post, put } from "./api";

const authService = {
  login(email, password) {
    return post(API.AUTH.LOGIN, { email, password });
  },
  register(data) {
    return post(API.AUTH.REGISTER, data);
  },
  logout() {
    return post(API.AUTH.LOGOUT);
  },
  getMe() {
    return get(API.AUTH.ME);
  },
  getProfile() {
    return get(API.AUTH.PROFILE);
  },
  updateProfile(data) {
    return put(API.AUTH.UPDATE_PROFILE, data);
  },
  changePassword(data) {
    return post(API.AUTH.CHANGE_PASSWORD, data);
  },
};

export default authService;
