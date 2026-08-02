import type { ApiService } from "@motanos/api";
import {
  createCreateBookingUseCase,
  type ApplicationService,
  type CreateBookingUseCase,
} from "@motanos/application";
import type { BookingService } from "@motanos/booking";
import type { AuthorizationService } from "@motanos/permissions";
import type { RuntimeConfig } from "../config/runtime-config";
import type { CreateBookingHandler } from "../contracts/create-booking-handler";
import type { MotanOSRuntime } from "../contracts/runtime";
import {
  createCreateBookingHandler,
  createDefaultApiService,
  createDefaultApplicationService,
  createInMemoryAuthorizationService,
  createInMemoryBookingService,
} from "../providers";
import { createRuntime, type CreateRuntimeOptions } from "./create-runtime";

export interface CreateMotanOSRuntimeOptions {
  config?: RuntimeConfig;
  /**
   * Inject a concrete AuthorizationService.
   * When omitted, a temporary in-memory provider is used (tests / local bootstrap).
   */
  authorization?: AuthorizationService;
  /**
   * Actors denied by the temporary in-memory authorization provider.
   * Ignored when `authorization` is supplied.
   */
  deniedActors?: readonly string[];
  /**
   * Inject a concrete BookingService.
   * When omitted, a temporary in-memory provider is used (tests / local bootstrap).
   */
  booking?: BookingService;
  /** Extra registry registrations after MotanOS defaults. */
  register?: CreateRuntimeOptions["register"];
}

/**
 * Official MotanOS composed runtime for the CreateBooking vertical slice.
 */
export interface MotanOSComposedRuntime {
  runtime: MotanOSRuntime;
  api: ApiService;
  application: ApplicationService;
  authorization: AuthorizationService;
  booking: BookingService;
  createBooking: CreateBookingUseCase;
  createBookingHandler: CreateBookingHandler;
}

/**
 * Official MotanOS bootstrap — composition root.
 *
 * Builds Authorization + Booking + CreateBooking + Application + API,
 * then attaches them via createRuntime().
 *
 * Does NOT start HTTP, open connections, load credentials, or call vendors.
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

  const createBooking = createCreateBookingUseCase({
    authorization,
    booking,
  });

  const application = createDefaultApplicationService();
  const api = createDefaultApiService();
  const createBookingHandler = createCreateBookingHandler({
    useCase: createBooking,
  });

  const runtime = createRuntime({
    config,
    services: {
      application,
      api,
      authorization,
      booking,
      createBooking,
      createBookingHandler,
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
    createBookingHandler,
  };
}
