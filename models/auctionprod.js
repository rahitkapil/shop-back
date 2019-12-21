const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const aproductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        description: {
            type: String,
            required: true,
            maxlength: 2000
        },
        sbid: {
            type: Number,
            trim: true,
            required: true,
            maxlength: 32
        },
        bid: {
            type: Array,
            default: []
        },
        category: {
            type: ObjectId,
            ref: "ACategory",
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        },
        sold: {
            type: Number,
            default: 0
        },
        photo: {
            data: Buffer,
            contentType: String
        },
        shipping: {
            required: false,
            type: Boolean
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("AProduct", aproductSchema);
