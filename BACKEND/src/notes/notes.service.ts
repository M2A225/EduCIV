import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { NotesRepository } from './notes.repository';

@Injectable()
export class NotesService {
	constructor(private readonly notesRepo: NotesRepository) {}

	async createNote(dto: CreateNoteDto) {
		return this.notesRepo.create({ content: dto.content, version: 1 });
	}

	async patchNote(id: number, content: string) {
		const note = await this.notesRepo.findOne({ where: { id } as any });
		if (!note) throw new NotFoundException('Note not found');
		
		return this.notesRepo.update(id, {
			content,
			version: (note.version || 1) + 1
		});
	}
}
