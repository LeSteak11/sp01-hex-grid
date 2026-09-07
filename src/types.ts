export type Category = 'grocery' | 'park' | 'transit';

export type Amenity = {
  position: [number, number];
  category: Category;
  name: string | null;
  area: number;
};