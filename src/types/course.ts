export interface Course {
  id: string;
  name: string;
  region: 'bangkok' | 'phuket' | 'hua_hin' | 'chiang_mai' | 'pattaya';
  location: string;
  par: number;
  yardage: number;
  holes: 18 | 9;
  tags: string[];
  heroImage: string;
  description: string;
  greenFee: {
    weekday: { guest: number; member: number };
    weekend: { guest: number; member: number };
  };
}
