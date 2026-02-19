// backend/models/Bus.js
import mongoose from "mongoose";

const BusSchema = new mongoose.Schema(
  {
    // Branch Reference
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    institution_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    // 1. Basic Information
    busId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    busType: {
      type: String,
      enum: ["Mini bus", "Standard bus", "Vans", "Other"],
      default: "Standard bus",
    },
    model: {
      type: String,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    buildYear: {
      type: Number,
      min: 1900,
      max: 2100,
    },
    busStatus: {
      type: String,
      enum: ["Active", "Under Maintenance"],
      default: "Active",
    },
    availability: {
      type: String,
      enum: ["Available", "Currently Assigned"],
      default: "Available",
    },

    // Driver Information
    driver: {
      driverName: {
        type: String,
        trim: true,
      },
      driverContact: {
        type: String,
        trim: true,
      },
      driverImage: {
        type: String, // URL or base64
        trim: true,
      },
      licenseNumber: {
        type: String,
        trim: true,
        uppercase: true,
      },
    },

    // Staff Information
    staff: {
      staffName: {
        type: String,
        trim: true,
      },
      staffContact: {
        type: String,
        trim: true,
      },
    },

    // Custom Fields
    customFields: [
      {
        fieldName: {
          type: String,
          trim: true,
        },
        fieldValue: {
          type: String,
          trim: true,
        },
      },
    ],

    // 2. Route Information
    route: {
      routeName: {
        type: String,
        trim: true,
      },
      stops: [
        {
          stopName: {
            type: String,
            trim: true,
          },
          timing: {
            type: String,
            trim: true,
          },
        },
      ],
      totalDistance: {
        type: Number,
        min: 0,
      },
      distanceUnit: {
        type: String,
        enum: ["km", "meters"],
        default: "km",
      },
      parkingPlace: {
        name: {
          type: String,
          trim: true,
        },
        address: {
          type: String,
          trim: true,
        },
      },
    },

    // 3. Safety Information
    safety: {
      firstAidKit: {
        type: Boolean,
        default: false,
      },
      fireExtinguisher: {
        type: Boolean,
        default: false,
      },
      emergencyContactNumber: {
        type: String,
        trim: true,
      },
      gpsInstalled: {
        type: Boolean,
        default: false,
      },
      cctv: {
        type: Boolean,
        default: false,
      },
      seatBelts: {
        type: Boolean,
        default: false,
      },
      speedGovernor: {
        type: Boolean,
        default: false,
      },
    },

    // 4. Maintenance Information
    maintenance: {
      lastServiceDate: {
        type: Date,
      },
      nextServiceDate: {
        type: Date,
      },
      pollutionCertificate: {
        fileName: {
          type: String,
          trim: true,
        },
        fileUrl: {
          type: String,
          trim: true,
        },
        fileData: {
          type: String, // Base64 encoded PDF
        },
        uploadDate: {
          type: Date,
        },
        expiryDate: {
          type: Date,
        },
        lastUpdatedDate: {
          type: Date,
        },
      },
      fitnessCertificate: {
        fileName: {
          type: String,
          trim: true,
        },
        fileUrl: {
          type: String,
          trim: true,
        },
        fileData: {
          type: String, // Base64 encoded PDF
        },
        uploadDate: {
          type: Date,
        },
        expiryDate: {
          type: Date,
        },
        lastUpdatedDate: {
          type: Date,
        },
      },
      permit: {
        fileName: {
          type: String,
          trim: true,
        },
        fileUrl: {
          type: String,
          trim: true,
        },
        fileData: {
          type: String, // Base64 encoded PDF
        },
        uploadDate: {
          type: Date,
        },
      },
      maintenanceNotes: {
        type: String,
        trim: true,
      },
    },

    // Additional Information
    remarks: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
BusSchema.index({ branch_id: 1 });
BusSchema.index({ institution_id: 1 });
BusSchema.index({ operationalStatus: 1 });

export const Bus = mongoose.model("Bus", BusSchema);
