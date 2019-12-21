const express = require("express");
const router = express.Router();

const {
    wcreate,
    wcategoryById,
    wread,
    wupdate,
    wremove,
    wlist
} = require("../controllers/womancat");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

router.get("/wcategory/:wcategoryId", wread);
router.post("/wcategory/wcreate/:userId", requireSignin, isAuth, isAdmin, wcreate);
router.put(
    "/wcategory/:wcategoryId/:userId",
    requireSignin,
    isAuth,
    isAdmin,
    wupdate
);
router.delete(
    "/wcategory/:wcategoryId/:userId",
    requireSignin,
    isAuth,
    isAdmin,
    wremove
);
router.get("/wcategories", wlist);

router.param("wcategoryId", wcategoryById);
router.param("userId", userById);

module.exports = router;
