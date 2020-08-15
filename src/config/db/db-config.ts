import { MONGO_URI } from '../index';
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  MongooseOptionsFactory,
  MongooseModuleOptions,
} from '@nestjs/mongoose';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  private logger = new Logger('MongoDB_Atlas');

  async createMongooseOptions(): Promise<MongooseModuleOptions> {
    try {
      const options: any = {
        uri: MONGO_URI,
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true,
      };
      this.logger.log('💾 Database connected');
      return await options;
    } catch (err) {
      this.logger.error(`❌ Database error: ${err.message}`);
      throw new InternalServerErrorException(err.message);
    }
  }
}
