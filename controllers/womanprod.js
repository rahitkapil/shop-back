const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const WProduct = require("../models/womanprod");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.wproductById = (req, res, next, id) => {
    WProduct.findById(id)
        .populate("category")
        .exec((err, wproduct) => {
            if (err || !wproduct) {
                return res.status(400).json({
                    error: "Product not found"
                });
            }
            req.wproduct = wproduct;
            next();
        });
};

exports.wread = (req, res) => {
    req.wproduct.photo = undefined;
    return res.json(req.wproduct);
};

exports.wcreate = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            });
        }
        // check for all fields
        const {
            name,
            description,
            price,
            category,
            quantity,
            shipping
        } = fields;

        if (
            !name ||
            !description ||
            !price ||
            !category ||
            !quantity ||
            !shipping
        ) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        let wproduct = new WProduct(fields);

        // 1kb = 1000
        // 1mb = 1000000

        if (files.photo) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1mb in size"
                });
            }
            wproduct.photo.data = fs.readFileSync(files.photo.path);
            wproduct.photo.contentType = files.photo.type;
        }

        wproduct.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};

exports.wremove = (req, res) => {
    let wproduct = req.wproduct;
    wproduct.remove((err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: "Product deleted successfully"
        });
    });
};

exports.wupdate = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            });
        }
        // check for all fields
        const {
            name,
            description,
            price,
            category,
            quantity,
            shipping
        } = fields;

        if (
            !name ||
            !description ||
            !price ||
            !category ||
            !quantity ||
            !shipping
        ) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        let wproduct = req.wproduct;
        wproduct = _.extend(wproduct, fields);

        // 1kb = 1000
        // 1mb = 1000000

        if (files.photo) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1mb in size"
                });
            }
            wproduct.photo.data = fs.readFileSync(files.photo.path);
            wproduct.photo.contentType = files.photo.type;
        }

        wproduct.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};

/**
 * sell / arrival
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * by arrival = /products?sortBy=createdAt&order=desc&limit=4
 * if no params are sent, then all products are returned
 */

exports.wlist = (req, res) => {
    let order = req.query.order ? req.query.order : "asc";
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    WProduct.find()
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .limit(limit)
        .exec((err, wproducts) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json(wproducts);
        });
};

/**
 * it will find the products based on the req product category
 * other products that has the same category, will be returned
 */

exports.wlistRelated = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    WProduct.find({ _id: { $ne: req.wproduct }, wcategory: req.wproduct.wcategory })
        .limit(limit)
        .populate("category", "_id name")
        .exec((err, wproducts) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json(wproducts);
        });
};

exports.wlistCategories = (req, res) => {
    WProduct.distinct("category", {}, (err, wcategories) => {
        if (err) {
            return res.status(400).json({
                error: "Categories not found"
            });
        }
        res.json(wcategories);
    });
};

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */

exports.wlistBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);

    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    WProduct.find(findArgs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};

exports.photo = (req, res, next) => {
    if (req.wproduct.photo.data) {
        res.set("Content-Type", req.wproduct.photo.contentType);
        return res.send(req.wproduct.photo.data);
    }
    next();
};

exports.wlistSearch = (req, res) => {
    // create query object to hold search value and category value
    const query = {};
    // assign search value to query.name
    if (req.query.search) {
        query.name = { $regex: req.query.search, $options: "i" };
        // assigne category value to query.category
        if (req.query.category && req.query.category != "All") {
            query.category = req.query.category;
        }
        // find the product based on query object with 2 properties
        // search and category
        WProduct.find(query, (err, wproducts) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(wproducts);
        }).select("-photo");
    }
};

exports.wdecreaseQuantity = (req, res, next) => {
    let bulkOps = req.body.order.wproducts.map(item => {
        return {
            updateOne: {
                filter: { _id: item._id },
                update: { $inc: { quantity: -item.count, sold: +item.count } }
            }
        };
    });

    WProduct.bulkWrite(bulkOps, {}, (error, wproducts) => {
        if (error) {
            return res.status(400).json({
                error: "Could not update product"
            });
        }
        next();
    });
};
