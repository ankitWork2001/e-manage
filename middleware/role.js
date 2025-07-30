export const isAdmin = (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    if (user.role !== "ownAdmin") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Admins only." });
    }

    // Proceed to next middleware if admin
    next();
  } catch (err) {
    console.error("Admin check error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error during admin check" });
  }
};
