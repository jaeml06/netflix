import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie) private readonly movieRepo: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepo: Repository<MovieDetail>,
  ) {}

  async getManyMovies(title?: string) {
    // 나중에 title로 필터링하는 기능 추가 예정

    if (!title) {
      return [await this.movieRepo.find(), await this.movieRepo.count()];
    }
    return await this.movieRepo.find({
      where: { title: Like(`%${title}%`) },
    });
    // if (!title) {
    //   return this.movies;
    // }
    // return this.movies.filter((movie) => movie.title.includes(title));
  }

  async getMovieById(id: number) {
    const movie = await this.movieRepo.findOne({
      where: { id },
      relations: ['detail'],
    });
    return movie;
    // const movie = this.movies.find((movie) => movie.id === +id);
    // if (!movie) {
    //   throw new NotFoundException('존제히지 않는 id의 영화입니다.');
    // }
    // return this.movies.find((movie) => movie.id === id);
  }
  async createMovie(createMovieDto: CreateMovieDto) {
    const movieDetail = await this.movieDetailRepo.save({
      detail: createMovieDto.detail,
    });
    const movie = await this.movieRepo.save({
      title: createMovieDto.title,
      genre: createMovieDto.genre,
      detail: movieDetail,
    });

    return movie;
    // const movie = {
    //   id: this.idCounter++,
    //   ...createMovieDto,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    //   version: 0,
    // };
    // this.movies.push(movie);
    // return movie;
  }
  async updateMovie(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepo.findOne({
      where: { id },
      relations: ['detail'],
    });
    if (!movie) {
      throw new NotFoundException('존제히지 않는 id의 영화입니다.');
    }

    const { detail, ...movieRest } = updateMovieDto;

    if (detail) {
      await this.movieDetailRepo.update({ id: movie.detail.id }, { detail });
    }

    await this.movieRepo.update({ id }, { ...movieRest });

    const newMovie = await this.movieRepo.findOne({
      where: { id },
      relations: ['detail'],
    });

    return newMovie;
    // const movie = this.movies.find((movie) => movie.id === +id);
    // if (!movie) {
    //   throw new NotFoundException('존제히지 않는 id의 영화입니다.');
    // }
    // Object.assign(movie, updateMovieDto);
    // return movie;
  }
  async deleteMovie(id: number) {
    const movie = await this.movieRepo.findOne({
      where: { id },
      relations: ['detail'],
    });
    if (!movie) {
      throw new NotFoundException('존제히지 않는 id의 영화입니다.');
    }

    await this.movieRepo.delete(id);
    await this.movieDetailRepo.delete(movie.detail.id);

    return id;

    // const movieIndex = this.movies.findIndex((movie) => movie.id === +id);
    // if (movieIndex === -1) {
    //   throw new NotFoundException('존제히지 않는 id의 영화입니다.');
    // }
    // this.movies.splice(movieIndex, 1);

    // return id;
  }
}
