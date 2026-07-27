export const queryKeys = {
  appointments: {
    all: (tenantId: string) => ['appointments', tenantId] as const,
    day: (tenantId: string, branchId: string | null, dateISO: string) =>
      ['appointments', tenantId, branchId, dateISO] as const,
  },
};
