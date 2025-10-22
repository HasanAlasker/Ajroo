import mongoose from "mongoose";

const borrowSchema = new mongoose.Schema(
  {
    item: {},
    owner: {},
    borrower: {},
    durationValue: {},
    durationUnit: {},
    pricePerDay: {},
    totalPrice: {},
    status: {
      // active / completed
    },
    startDate: {},
    endDate: {},
    borrowerReturnedAt: {},
    owernrConfirmedReturnAt: {},
    returnState: {
      // ontime - late
    },
    daysLate:{

    },
    lateFees:{

    },
    owenerRating: {},
    borrowerRating: {},
    strikesGiven: {},
  },
  { timestamps: true }
);

const BorrowModel = mongoose.model("Borrow", borrowSchema);
export default BorrowModel;
