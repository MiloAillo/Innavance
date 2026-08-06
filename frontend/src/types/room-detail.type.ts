export interface RoomAddon {
  id: number;
  addon: string;
  price: number;
  borrowMaximum: number;
}

export interface RoomDetail {
  id: number;
  name: string;
  price: number;
  capacity: number;
  description: string;
  isAvailable: boolean;
  features: string[];
  addons: RoomAddon[];
}
