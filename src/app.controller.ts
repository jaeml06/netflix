import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';

interface Movie {
  id: number;
  title: string;
}
@Controller('movie')
export class AppController {
  private movies: Movie[] = [
    {
      id: 1,
      title: '해리포터',
    },
    {
      id: 2,
      title: '반지의 제왕',
    },
  ];
  private idCounter = 3;
  constructor(private readonly appService: AppService) {}

  @Get()
  getMovies(@Query('title') title?: string) {
    if (!title) {
      return this.movies;
    }
    return this.movies.filter((movie) => movie.title.includes(title));
  }

  @Get(':id')
  getMoive(@Param('id') id: string) {
    const movie = this.movies.find((movie) => movie.id === +id);
    console.log(movie);
    if (!movie) {
      throw new NotFoundException('존제히지 않는 id의 영화입니다.');
    }

    return movie;
  }

  @Post()
  postMovie(@Body('title') title: string) {
    const movie = {
      id: this.idCounter++,
      title,
    };
    this.movies.push(movie);
    return movie;
  }

  @Patch(':id')
  patchMovie(@Param('id') id: string, @Body('title') title: string) {
    const movie = this.movies.find((movie) => movie.id === +id);
    if (!movie) {
      throw new NotFoundException('존제히지 않는 id의 영화입니다.');
    }
    movie.title = title;
    return movie;
  }

  @Delete(':id')
  deleteMovie(@Param('id') id: string) {
    const movieIndex = this.movies.findIndex((movie) => movie.id === +id);
    if (movieIndex === -1) {
      throw new NotFoundException('존제히지 않는 id의 영화입니다.');
    }
    this.movies.splice(movieIndex, 1);

    return id;
  }
}
