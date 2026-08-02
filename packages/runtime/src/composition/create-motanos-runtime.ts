import type { ApiService } from "@motanos/api";
import {
  createCancelBookingUseCase,
  createConfirmBookingUseCase,
  createCreateBookingUseCase,
  type ApplicationService,
  type CancelBookingUseCase,
  type ConfirmBookingUseCase,
  type CreateBookingUseCase,
} from "@motanos/application";
import type { BookingService } from "@motanos/booking";
import type { AuthorizationService } from "@motanos/permissions";
import type { RuntimeConfig } from "../config/runtime-config";
import type {
  CancelBookingHandler,
  ConfirmBookingHandler,
  CreateBookingHandler,
} from "../contracts/create-booking-handler";
import type { MotanOSRuntime } from "../contracts/runtime";
import {
  createCancelBookingHandler,
  createConfirmBookingHandler,
  createCreateBookingHandler,
  createDefaultApiService,
  createDefaultApplicationService,
  createInMemoryAuthorizationService,
  createInMemoryBookingService,
} from "../providers";
import { createRuntime, type CreateRuntimeOptions } from "./create-runtime";

export interface CreateMotanOSRuntimeOptions {
  config?: RuntimeConfig;
  authorization?: AuthorizationService;
  deniedActors?: readonly string[];
  booking?: BookingService;
  register?: CreateRuntimeOptions["register"];
}

export interface MotanOSComposedRuntime {
  runtime: MotanOSRuntime;
  api: ApiService;
  application: ApplicationService;
  authorization: AuthorizationService;
  booking: BookingService;
  createBooking: CreateBookingUseCase;
  confirmBooking: ConfirmBookingUseCase;
  cancelBooking: CancelBookingUseCase;
  createBookingHandler: CreateBookingHandler;
  confirmBookingHandler: ConfirmBookingHandler;
  cancelBookingHandler: CancelBookingHandler;
}

/**
 * Official MotanOS bootstrap — Create / Confirm / Cancel Booking composition.
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

  const booking = options.booking ?? createInMemoryBookingService();

  const createBooking = createCreateBookingUseCase({ authorization, booking });
  const confirmBooking = createConfirmBookingUseCase({
    authorization,
    booking,
  });
  const cancelBooking = createCancelBookingUseCase({ authorization, booking });

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
      createBookingHandler,
      confirmBookingHandler,
      cancelBookingHandler,
    },
    register: options.register,
  });

  return {
    runtime,
    api,
    application,
    authorization,
    booking,
    createBooking,
    confirmBooking,
    cancelBooking,
    createBookingHandler,
    confirmBookingHandler,
    cancelBookingHandler,
  };
}
