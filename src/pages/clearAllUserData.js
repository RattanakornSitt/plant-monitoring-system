export const clearAllUserData = () => {
  localStorage.clear();
  sessionStorage.clear();
  // หรือเจาะจงเฉพาะ key ที่ต้องล้าง เช่น:
  // localStorage.removeItem("notifications");
};
