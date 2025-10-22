import mongoose from "mongoose";

const borrowSchema = new mongoose.Schema(
  {
    item: {},
    owner: {},
    borrower: {},
    durationValue: {},
    durationUnit: {},
    totalPrice: {},
    status: {
      // active / completed
    },
    startDate: {},
    endDate: {},
    borrowerReturnedAt: {},
    owernrConfirmedReturnAt: {},
    strikesGiven: {},
  },
  { timestamps: true }
);

const BorrowModel = mongoose.model("Borrow", borrowSchema);
export default BorrowModel;
