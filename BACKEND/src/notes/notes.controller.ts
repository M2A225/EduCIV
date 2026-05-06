import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
	constructor(private readonly notesService: NotesService) {}

	@Post()
	async create(@Body() body: CreateNoteDto) {
		const n = await this.notesService.createNote(body);
		return { success: true, data: n, error: null };
	}

	@Patch(':id')
	async patch(@Param('id') id: string, @Body('content') content: string) {
		const n = await this.notesService.patchNote(Number(id), content);
		return { success: true, data: n, error: null };
	}
}

