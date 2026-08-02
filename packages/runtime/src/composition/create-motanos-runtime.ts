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
import type { BookingRepository, BookingService } from "@motanos/booking";
import {
  createBookingService,
  createInMemoryBookingRepository,
} from "@motanos/booking";
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
  /** Override both repository and service when provided. */
  booking?: BookingService;
  bookingRepository?: BookingRepository;
  register?: CreateRuntimeOptions["register"];
}

export interface MotanOSComposedRuntime {
  runtime: MotanOSRuntime;
  api: ApiService;
  application: ApplicationService;
  authorization: AuthorizationService;
  /** Persistence adapter wired into BookingService (foundation: in-memory). */
  bookingRepository: BookingRepository;
  booking: BookingService;
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
 * Official MotanOS bootstrap — Booking write/read/reschedule composition.
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

  if (options.booking !== undefined) {
    booking = options.booking;
    bookingRepository =
      options.bookingRepository ?? createInMemoryBookingRepository();
  } else if (options.bookingRepository !== undefined) {
    bookingRepository = options.bookingRepository;
    booking = createBookingService(bookingRepository);
  } else {
    const stack = createInMemoryBookingStack();
    bookingRepository = stack.repository;
    booking = stack.booking;
  }

  const createBooking = createCreateBookingUseCase({ authorization, booking });
  const confirmBooking = createConfirmBookingUseCase({
    authorization,
    booking,
  });
  const cancelBooking = createCancelBookingUseCase({ authorization, booking });
  const checkAvailability = createCheckAvailabilityUseCase({
    authorization,
    booking,
  });
  const getBooking = createGetBookingUseCase({ authorization, booking });
  const listBookings = createListBookingsUseCase({ authorization, booking });
  const rescheduleBooking = createRescheduleBookingUseCase({
    authorization,
    booking,
  });
  const expireBookingHolds = createExpireBookingHoldsUseCase({
    authorization,
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
    bookingRepository,
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
  };
}
