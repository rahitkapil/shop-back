const express = require("express");
const router = express.Router();

const {
    wcreate,
    wproductById,
    wread,
    wremove,
    wupdate,
    wlist,
    wlistRelated,
    wlistCategories,
    wlistBySearch,
    photo,
    wlistSearch
} = require("../controllers/womanprod");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

router.get("/wproduct/:productId", wread);
router.post("/wproduct/wcreate/:userId", requireSignin, isAuth, isAdmin, wcreate);
router.delete(
    "/wproduct/:productId/:userId",
    requireSignin,
    isAuth,
    isAdmin,
    wremove
);
router.put(
    "/wproduct/:productId/:userId",
    requireSignin,
    isAuth,
    isAdmin,
    wupdate
);

router.get("/wproducts", wlist);
router.get("/wproducts/search", wlistSearch);
router.get("/wproducts/wrelated/:productId", wlistRelated);
router.get("/wproducts/wcategories", wlistCategories);
router.post("/wproducts/by/search", wlistBySearch);
router.get("/wproduct/wphoto/:productId", photo);

router.param("userId", userById);
router.param("productId", wproductById);

module.exports = router;
