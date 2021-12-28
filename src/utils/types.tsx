export type Barbers = {
  id: number;
  firstName: string;
  lastName: string;
  workHours: any[];
};

export type Services = {
  id: number;
  name: string;
  durationMinutes: number;
  price: string;
};

export type Appointments = {
  id: number;
  startDate: number;
  barberId: number;
  serviceId: number;
};
