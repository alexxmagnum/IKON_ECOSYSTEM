import type { ApplicationService } from "@motanos/application";

/**
 * Thin ApplicationService: delegates to the supplied UseCase.
 */
export function createDefaultApplicationService(): ApplicationService {
  return {
    async execute(useCase, input, context) {
      return useCase.execute(input, context);
    },
  };
}
