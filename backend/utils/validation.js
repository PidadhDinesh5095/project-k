import Joi from 'joi';

// Indian mobile numbers, stored with country code and no symbols: 919876543210
const phone = Joi.string().pattern(/^91[6-9]\d{9}$/).required().messages({
  'string.pattern.base': 'Phone must be a valid Indian mobile number in the format 91XXXXXXXXXX',
});

const uuid = Joi.string().uuid();
const slot = Joi.string().valid('MORNING', 'EVENING');

const schemas = {
  sendOtp: Joi.object({ phone }),
  verifyOtp: Joi.object({ phone, otp: Joi.string().length(6).pattern(/^\d+$/).required() }),
  refresh: Joi.object({ refreshToken: Joi.string().required() }),

  completeProfile: Joi.object({
    firstName: Joi.string().trim().min(1).max(50).required(),
    lastName: Joi.string().trim().min(1).max(50).required(),
    email: Joi.string().email().allow('', null),
    dob: Joi.date().iso().max('now').allow('', null),
  }),
  updateProfile: Joi.object({
    firstName: Joi.string().trim().min(1).max(50),
    lastName: Joi.string().trim().min(1).max(50),
    email: Joi.string().email(),
    dob: Joi.date().iso().max('now'),
  }),

  createAddress: Joi.object({
    residenceType: Joi.string().valid('COMMUNITY_APARTMENT', 'INDEPENDENT').required(),
    flatNoApartmentFloor: Joi.string().trim().required(),
    // Block/Tower is required only for community/apartment residences, per the address screen.
    blockTower: Joi.when('residenceType', {
      is: 'COMMUNITY_APARTMENT',
      then: Joi.string().trim().required(),
      otherwise: Joi.string().trim().allow('', null),
    }),
    pincode: Joi.string().pattern(/^\d{6}$/).required(),
    landmark: Joi.string().trim().allow('', null),
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    deliveryInstructions: Joi.array().items(
      Joi.string().valid('PET_AT_HOME', 'LEAVE_AT_DOOR', 'RING_BELL', 'PLACE_IN_BAG', 'AT_SHOE_RACK', 'AT_SECURITY')
    ),
    isDefault: Joi.boolean(),
  }),
  updateAddress: Joi.object({
    residenceType: Joi.string().valid('COMMUNITY_APARTMENT', 'INDEPENDENT'),
    flatNoApartmentFloor: Joi.string().trim(),
    blockTower: Joi.string().trim().allow('', null),
    pincode: Joi.string().pattern(/^\d{6}$/),
    landmark: Joi.string().trim().allow('', null),
    lat: Joi.number().min(-90).max(90),
    lng: Joi.number().min(-180).max(180),
    deliveryInstructions: Joi.array().items(
      Joi.string().valid('PET_AT_HOME', 'LEAVE_AT_DOOR', 'RING_BELL', 'PLACE_IN_BAG', 'AT_SHOE_RACK', 'AT_SECURITY')
    ),
  }),

  topup: Joi.object({ amount: Joi.number().min(10).max(50000).required() }),
  verifyTopup: Joi.object({
    razorpayOrderId: Joi.string().required(),
    razorpayPaymentId: Joi.string().required(),
    razorpaySignature: Joi.string().required(),
    amount: Joi.number().min(10).max(50000).required(),
  }),

  createOrder: Joi.object({
    productId: uuid.required(),
    addressId: uuid.required(),
    quantity: Joi.number().integer().min(1).max(50).required(),
    deliveryDate: Joi.date().iso().min('now').required(),
    slot: slot.required(),
  }),

  // Three shapes, one per frequency, matching the three subscription screens.
  createSubscription: Joi.object({
    productId: uuid.required(),
    addressId: uuid.required(),
    frequency: Joi.string().valid('DAILY', 'ALTERNATE', 'CUSTOM').required(),
    startDate: Joi.date().iso().min('now').required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).allow(null),

    dailyQuantity: Joi.when('frequency', {
      is: 'DAILY',
      then: Joi.number().integer().min(1).max(50).required(),
      otherwise: Joi.forbidden(),
    }),
    // Daily has no slot picker on that screen (both shown disabled) — optional,
    // defaults to MORNING server-side if omitted.
    dailySlot: Joi.when('frequency', {
      is: 'DAILY',
      then: slot.optional(),
      otherwise: Joi.forbidden(),
    }),
    alternateConfig: Joi.when('frequency', {
      is: 'ALTERNATE',
      then: Joi.object({
        slots: Joi.array().items(slot).min(1).required(),
        startDateQuantity: Joi.number().integer().min(1).max(50).required(),
        succeedingDayQuantity: Joi.number().integer().min(1).max(50).required(),
      }).required(),
      otherwise: Joi.forbidden(),
    }),
    customConfig: Joi.when('frequency', {
      is: 'CUSTOM',
      then: Joi.object({
        slots: Joi.array().items(slot).min(1).required(),
        selectedDays: Joi.array().items(Joi.string().valid('SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA')).min(1).required(),
        quantityPerDay: Joi.object().pattern(
          Joi.string().valid('SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'),
          Joi.number().integer().min(1).max(50)
        ).required(),
      }).required(),
      otherwise: Joi.forbidden(),
    }),
  }),
  pauseSubscription: Joi.object({
    startDate: Joi.date().iso().min('now').required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    reason: Joi.string().max(200).allow('', null),
  }),
  skipDates: Joi.object({
    dates: Joi.array().items(Joi.date().iso().min('now')).min(1).required(),
  }),

  deviceToken: Joi.object({ deviceToken: Joi.string().required() }),

  addPaymentMethod: Joi.object({
    type: Joi.string().valid('UPI', 'CARD').required(),
    razorpayTokenId: Joi.string().required(),
    displayLabel: Joi.string().max(60).required(),
    isDefault: Joi.boolean(),
  }),
};

export default schemas;
