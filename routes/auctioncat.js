const express = require("express");
const router = express.Router();

const {
    acreate,
    acategoryById,
    aread,
    aupdate,
    aremove,
    alist
} = require("../controllers/auctioncat");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

router.get("/acategory/:acategoryId", aread);
router.post("/acategory/acreate/:userId", requireSignin, isAuth, isAdmin, acreate);
router.put(
    "/acategory/:acategoryId/:userId",
    requireSignin,
    isAuth,
    isAdmin,
    aupdate
);
router.delete(
    "/acategory/:acategoryId/:userId",
    requireSignin,
    isAuth,
    isAdmin,
    aremove
);
router.get("/acategories", alist);

router.param("acategoryId", acategoryById);
router.param("userId", userById);

module.exports = router;
