// Program Data Interface - No types
export const CreateProgramDTO = {
  title: '',
  description: '',
  date: '',
  maxParticipants: 0,
  placeId: ''
};

export const UpdateProgramDTO = {
  title: '',
  description: '',
  date: '',
  placeId: '',
  status: ''
};

export const ProgramResponse = {
  id: '',
  title: '',
  description: '',
  date: '',
  maxParticipants: 0,
  currentParticipants: 0,
  status: '',
  placeId: '',
  place: {},
  donations: [],
  registrations: [],
  createdAt: '',
  updatedAt: ''
};
