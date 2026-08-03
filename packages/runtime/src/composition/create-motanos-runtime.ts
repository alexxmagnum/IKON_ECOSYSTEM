import type { ApiService } from "@motanos/api";
import {
  createCancelBookingUseCase,
  createCheckAvailabilityUseCase,
  createConfirmBookingUseCase,
  createCreateBookingUseCase,
  createGetBookingUseCase,
  createListBookingsUseCase,
  createRescheduleBookingUseCase,
  createExpireBookingHoldsUseCase,
  createBookingAuthorizationPolicyFromAuthorization,
  type ApplicationService,
  type CancelBookingUseCase,
  type CheckAvailabilityUseCase,
  type ConfirmBookingUseCase,
  type CreateBookingUseCase,
  type ExpireBookingHoldsUseCase,
  type GetBookingUseCase,
  type ListBookingsUseCase,
  type RescheduleBookingUseCase,
} from "@motanos/application";
import type {
  BookingAuthorizationPolicy,
  BookingQueryService,
  BookingRepository,
  BookingService,
} from "@motanos/booking-lifecycle";
import {
  createBookingQueryService,
  createBookingService,
  createInMemoryBookingRepository,
} from "@motanos/booking-lifecycle";
import type { AuthorizationService } from "@motanos/permissions";
import type { RuntimeConfig } from "../config/runtime-config";
import type {
  CancelBookingHandler,
  CheckAvailabilityHandler,
  ConfirmBookingHandler,
  CreateBookingHandler,
  ExpireBookingHoldsHandler,
  GetBookingHandler,
  ListBookingsHandler,
  RescheduleBookingHandler,
} from "../contracts/create-booking-handler";
import type { MotanOSRuntime } from "../contracts/runtime";
import {
  createCancelBookingHandler,
  createCheckAvailabilityHandler,
  createConfirmBookingHandler,
  createCreateBookingHandler,
  createDefaultApiService,
  createDefaultApplicationService,
  createExpireBookingHoldsHandler,
  createGetBookingHandler,
  createInMemoryAuthorizationService,
  createInMemoryBookingStack,
  createListBookingsHandler,
  createRescheduleBookingHandler,
} from "../providers";
import { createRuntime, type CreateRuntimeOptions } from "./create-runtime";

export interface CreateMotanOSRuntimeOptions {
  config?: RuntimeConfig;
  authorization?: AuthorizationService;
  deniedActors?: readonly string[];
  booking?: BookingService;
  bookingQuery?: BookingQueryService;
  bookingRepository?: BookingRepository;
  register?: CreateRuntimeOptions["register"];
}

export interface MotanOSComposedRuntime {
  runtime: MotanOSRuntime;
  api: ApiService;
  application: ApplicationService;
  authorization: AuthorizationService;
  bookingAuthorizationPolicy: BookingAuthorizationPolicy;
  bookingRepository: BookingRepository;
  booking: BookingService;
  bookingQuery: BookingQueryService;
  createBooking: CreateBookingUseCase;
  confirmBooking: ConfirmBookingUseCase;
  cancelBooking: CancelBookingUseCase;
  checkAvailability: CheckAvailabilityUseCase;
  getBooking: GetBookingUseCase;
  listBookings: ListBookingsUseCase;
  rescheduleBooking: RescheduleBookingUseCase;
  expireBookingHolds: ExpireBookingHoldsUseCase;
  createBookingHandler: CreateBookingHandler;
  confirmBookingHandler: ConfirmBookingHandler;
  cancelBookingHandler: CancelBookingHandler;
  checkAvailabilityHandler: CheckAvailabilityHandler;
  getBookingHandler: GetBookingHandler;
  listBookingsHandler: ListBookingsHandler;
  rescheduleBookingHandler: RescheduleBookingHandler;
  expireBookingHoldsHandler: ExpireBookingHoldsHandler;
}

/**
 * Official MotanOS bootstrap — command + query Booking composition.
 */
export function createMotanOSRuntime(
  options: CreateMotanOSRuntimeOptions = {},
): MotanOSComposedRuntime {
  const config: RuntimeConfig = options.config ?? {
    environment: "development",
  };

  const authorization =
    options.authorization ??
    createInMemoryAuthorizationService({
      deniedActors: options.deniedActors,
    });

  let bookingRepository: BookingRepository;
  let booking: BookingService;
  let bookingQuery: BookingQueryService;

  if (options.booking !== undefined || options.bookingQuery !== undefined) {
    bookingRepository =
      options.bookingRepository ?? createInMemoryBookingRepository();
    booking =
      options.booking ?? createBookingService(bookingRepository);
    bookingQuery =
      options.bookingQuery ?? createBookingQueryService(bookingRepository);
  } else if (options.bookingRepository !== undefined) {
    bookingRepository = options.bookingRepository;
    booking = createBookingService(bookingRepository);
    bookingQuery = createBookingQueryService(bookingRepository);
  } else {
    const stack = createInMemoryBookingStack();
    bookingRepository = stack.repository;
    booking = stack.booking;
    bookingQuery = stack.bookingQuery;
  }

  const bookingAuthorizationPolicy =
    createBookingAuthorizationPolicyFromAuthorization(authorization);

  const createBooking = createCreateBookingUseCase({
    bookingAuthorizationPolicy,
    booking,
  });
  const confirmBooking = createConfirmBookingUseCase({
    bookingAuthorizationPolicy,
    booking,
    bookingQuery,
  });
  const cancelBooking = createCancelBookingUseCase({
    bookingAuthorizationPolicy,
    booking,
    bookingQuery,
  });
  const checkAvailability = createCheckAvailabilityUseCase({
    bookingAuthorizationPolicy,
    bookingQuery,
  });
  const getBooking = createGetBookingUseCase({
    bookingAuthorizationPolicy,
    bookingQuery,
  });
  const listBookings = createListBookingsUseCase({
    bookingAuthorizationPolicy,
    bookingQuery,
  });
  const rescheduleBooking = createRescheduleBookingUseCase({
    bookingAuthorizationPolicy,
    booking,
    bookingQuery,
  });
  const expireBookingHolds = createExpireBookingHoldsUseCase({
    bookingAuthorizationPolicy,
    booking,
  });

  const application = createDefaultApplicationService();
  const api = createDefaultApiService();

  const createBookingHandler = createCreateBookingHandler({
    useCase: createBooking,
  });
  const confirmBookingHandler = createConfirmBookingHandler({
    useCase: confirmBooking,
  });
  const cancelBookingHandler = createCancelBookingHandler({
    useCase: cancelBooking,
  });
  const checkAvailabilityHandler = createCheckAvailabilityHandler({
    useCase: checkAvailability,
  });
  const getBookingHandler = createGetBookingHandler({ useCase: getBooking });
  const listBookingsHandler = createListBookingsHandler({
    useCase: listBookings,
  });
  const rescheduleBookingHandler = createRescheduleBookingHandler({
    useCase: rescheduleBooking,
  });
  const expireBookingHoldsHandler = createExpireBookingHoldsHandler({
    useCase: expireBookingHolds,
  });

  const runtime = createRuntime({
    config,
    services: {
      application,
      api,
      authorization,
      booking,
      createBooking,
      confirmBooking,
      cancelBooking,
      checkAvailability,
      getBooking,
      listBookings,
      rescheduleBooking,
      expireBookingHolds,
      createBookingHandler,
      confirmBookingHandler,
      cancelBookingHandler,
      checkAvailabilityHandler,
      getBookingHandler,
      listBookingsHandler,
      rescheduleBookingHandler,
      expireBookingHoldsHandler,
    },
    register: options.register,
  });

  return {
    runtime,
    api,
    application,
    authorization,
    bookingAuthorizationPolicy,
    bookingRepository,
    booking,
    bookingQuery,
    createBooking,
    confirmBooking,
    cancelBooking,
    checkAvailability,
    getBooking,
    listBookings,
    rescheduleBooking,
    expireBookingHolds,
    createBookingHandler,
    confirmBookingHandler,
    cancelBookingHandler,
    checkAvailabilityHandler,
    getBookingHandler,
    listBookingsHandler,
    rescheduleBookingHandler,
    expireBookingHoldsHandler,
  };
}
