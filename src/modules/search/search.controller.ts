import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Глобальный поиск по постам, людям и категориям' })
  async search(@Query('q') query: string) {
    if (!query) throw new BadRequestException('Строка поиска пуста');
    return this.searchService.globalSearch(query);
  }
}
