const express = require("express");
const router = express.Router();

const {
    acreate,
    aproductById,
    aread,
    aremove,
    aupdate,
    alist,
    alistRelated,
    alistCategories,
    alistBySearch,
    photo,
    alistSearch
} = require("../controllers/auctionprod");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

router.get("/aproduct/:productId", aread);
router.post("/aproduct/acreate/:userId", requireSignin, isAuth, isAdmin, acreate);
router.delete(
    "/aproduct/:productId/:userId",
    requireSignin,
    isAuth,
    isAdmin,
    aremove
);
router.put(
    "/aproduct/:productId/:userId",
    requireSignin,
    isAuth,
    isAdmin,
    aupdate
);

router.get("/aproducts", alist);
router.get("/aproducts/search", alistSearch);
router.get("/aproducts/arelated/:productId", alistRelated);
router.get("/aproducts/acategories", alistCategories);
router.post("/aproducts/by/search", alistBySearch);
router.get("/aproduct/aphoto/:productId", photo);

router.param("userId", userById);
router.param("productId", aproductById);

module.exports = router;
