import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { number } from 'joi';
@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie) private readonly movieRepo: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepo: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepo: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepo: Repository<Genre>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(title?: string) {
    // 나중에 title로 필터링하는 기능 추가 예정
    const qb = this.movieRepo
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title LIKE :title', { title: `%${title}%` });
    }
    return await qb.getManyAndCount();

    // if (!title) {
    //   return [
    //     await this.movieRepo.find({
    //       relations: ['director', 'genres'],
    //     }),
    //     await this.movieRepo.count(),
    //   ];
    // }
    // return await this.movieRepo.find({
    //   where: { title: Like(`%${title}%`) },
    //   relations: ['director', 'genres'],
    // });
    // if (!title) {
    //   return this.movies;
    // }
    // return this.movies.filter((movie) => movie.title.includes(title));
  }

  async findOne(id: number) {
    const movie = await this.movieRepo
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.detail', 'detail')
      .where('movie.id = :id', { id })
      .getOne();
    // const movie = await this.movieRepo.findOne({
    //   where: { id },
    //   relations: ['detail'],
    // });
    // return movie;
    // const movie = this.movies.find((movie) => movie.id === +id);
    // if (!movie) {
    //   throw new NotFoundException('존제히지 않는 id의 영화입니다.');
    // }
    // return this.movies.find((movie) => movie.id === id);
    if (!movie) {
      throw new NotFoundException('존제히지 않는 id의 영화입니다.');
    }
    return movie;
  }
  async create(createMovieDto: CreateMovieDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const director = await qr.manager.findOne(Director, {
        where: { id: createMovieDto.directorId },
      });
      if (!director) {
        throw new NotFoundException('존제히지 않는 id의 감독입니다.');
      }

      const genres = await qr.manager.find(Genre, {
        where: { id: In(createMovieDto.genreIds) },
      });
      if (genres.length !== createMovieDto.genreIds.length) {
        throw new NotFoundException(
          `존제히지 않는 장르가 있습니다! 존재하는 ids -> ${genres.map((genre) => genre.id).join(',')}`,
        );
      }
      const movieDetailResult = await qr.manager
        .createQueryBuilder()
        .insert()
        .into(MovieDetail)
        .values({
          detail: createMovieDto.detail,
        })
        .execute();
      const movieDetailId: number = movieDetailResult.identifiers[0]
        .id as number;

      const movie = await qr.manager
        .createQueryBuilder()
        .insert()
        .into(Movie)
        .values({
          title: createMovieDto.title,
          detail: {
            id: movieDetailId,
          },
          director,
        })
        .execute();
      const movieId: number = movie.identifiers[0].id as number;
      await qr.manager
        .createQueryBuilder()
        .relation(Movie, 'genres')
        .of(movieId)
        .add(genres.map((genre) => genre.id));

      await qr.commitTransaction();

      return await this.movieRepo.findOne({
        where: {
          id: movieId,
        },
        relations: ['detail', 'director', 'genres'],
      });
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }

    // const movie = await this.movieRepo.save({
    //   title: createMovieDto.title,
    //   detail: {
    //     detail: createMovieDto.detail,
    //   },
    //   director,
    //   genres,
    // });

    // return movie;
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
  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const movie = await qr.manager.findOne(Movie, {
        where: { id },
        relations: ['detail'],
      });
      if (!movie) {
        throw new NotFoundException('존제히지 않는 id의 영화입니다.');
      }

      const { detail, directorId, genreIds, ...movieRest } = updateMovieDto;

      let newDirector: Director | null = null;
      let newGenres: Genre[] | undefined;

      if (directorId) {
        const director = await qr.manager.findOne(Director, {
          where: { id: directorId },
        });
        if (!director) {
          throw new NotFoundException('존제히지 않는 id의 감독입니다.');
        }
        newDirector = director;
      }
      if (detail) {
        await qr.manager
          .createQueryBuilder()
          .update(MovieDetail)
          .set({
            detail,
          })
          .where('id = :id', { id: movie.detail.id })
          .execute();
        // await this.movieDetailRepo.update({ id: movie.detail.id }, { detail });
      }

      if (genreIds) {
        const genres = await qr.manager.find(Genre, {
          where: { id: In(genreIds) },
        });
        if (genres.length !== genreIds.length) {
          throw new NotFoundException(
            `존제히지 않는 장르가 있습니다! 존재하는 ids -> ${genres.map((genre) => genre.id).join(',')}`,
          );
        }
        newGenres = genres;
      }

      const movieUpdateFields = {
        ...movieRest,
        ...(newDirector && { director: newDirector }),
      };

      await qr.manager
        .createQueryBuilder()
        .update(Movie)
        .set(movieUpdateFields)
        .where('id = :id', { id })
        .execute();

      // await this.movieRepo.update({ id }, { ...movieUpdateFields });
      if (newGenres) {
        await qr.manager
          .createQueryBuilder()
          .relation(Movie, 'genres')
          .of(id)
          .addAndRemove(
            newGenres.map((genre) => genre.id),
            movie.genres.map((genre) => genre.id),
          );
      }
      await qr.commitTransaction();
      return this.movieRepo.findOne({
        where: {
          id,
        },
        relations: ['detail', 'director', 'genres'],
      });
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }

    // const newMovie = await this.movieRepo.findOne({
    //   where: { id },
    //   relations: ['detail', 'director'],
    // });

    // if (!newMovie) {
    //   throw new NotFoundException('존제히지 않는 id의 영화입니다.');
    // }

    // if (newGenres) {
    //   newMovie.genres = newGenres;
    // }

    // await this.movieRepo.save(newMovie);

    // return this.movieRepo.findOne({
    //   where: {
    //     id,
    //   },
    //   relations: ['detail', 'director', 'genres'],
    // });
    // const movie = this.movies.find((movie) => movie.id === +id);
    // if (!movie) {
    //   throw new NotFoundException('존제히지 않는 id의 영화입니다.');
    // }
    // Object.assign(movie, updateMovieDto);
    // return movie;
  }
  async remove(id: number) {
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
