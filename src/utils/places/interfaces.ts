export interface Place {
  id: number;
  name: string;
  country_speciality: string;
  lat: number;
  lng: number;
  rating: number;
  price_range: number;
  can_bring_reusable_content: boolean;
  image: string;
  fk_lunch_group: number;
}
