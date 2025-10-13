import { Transform } from 'class-transformer';

export class Movie {
  id: number;
  title: string;

  //@Expose()
  //@Exclude()
  @Transform(({ value }) => 'code factory')
  genre: string;
}
