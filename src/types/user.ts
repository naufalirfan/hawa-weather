export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface SavedLoc {
  id: string;
  user_id?: string;
  name: string;
  custom_label: string;
  lat: number;
  lon: number;
  is_primary: number;
  created_at?: string;
}
