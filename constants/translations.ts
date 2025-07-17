export type Language = 'pt-BR' | 'en';

export interface Translations {
  // Navegação
  home: string;
  members: string;
  treatments: string;
  chat: string;
  documents: string;
  profile: string;
  settings: string;
  dossier: string;

  // Menu Drawer
  addMember: string;
  newTreatment: string;
  documentAnalysis: string;
  memberDetails: string;
  editMember: string;
  memberDossier: string;
  treatmentDetails: string;
  intelligentChat: string;
  logout: string;
  loading: string;
  defaultUserName: string;

  // Tela Principal
  todayAgenda: string;
  familyMembers: string;
  noTreatmentsToday: string;
  noMembers: string;
  viewAll: string;

  // Membros
  addNewMember: string;
  fullName: string;
  relation: string;
  birthDate: string;
  notes: string;
  additionalInfo: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  view: string;
  complete: string;
  touchToAddPhoto: string;
  touchToChangePhoto: string;

  // Tratamentos
  addTreatment: string;
  editTreatment: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: string;
  startTime: string;
  status: string;
  active: string;
  completed: string;
  paused: string;
  allTreatments: string;
  description: string;
  actions: string;
  confirmDelete: string;
  deleteTreatmentConfirm: string;
  yes: string;
  no: string;

  // Dossiê
  medicalDossier: string;
  selectMemberDossier: string;
  noMembersFound: string;
  addFamilyMembers: string;
  loadingMembers: string;

  // Configurações
  general: string;
  language: string;
  notifications: string;
  darkTheme: string;
  information: string;
  aboutApp: string;
  privacyPolicy: string;
  logout: string;
  portuguese: string;
  english: string;

  // Perfil
  userProfile: string;
  name: string;
  email: string;
  updateProfile: string;

  // Chat
  intelligentChat: string;
  documentAnalysis: string;

  // Mensagens
  success: string;
  error: string;
  memberAddedSuccess: string;
  memberUpdatedSuccess: string;
  memberDeletedSuccess: string;
  treatmentAddedSuccess: string;
  treatmentUpdatedSuccess: string;
  treatmentDeletedSuccess: string;
  profileUpdatedSuccess: string;
  requiredFields: string;
  nameAndRelationRequired: string;
  errorLoadingData: string;
  errorSavingData: string;
  errorDeletingData: string;

  // Placeholders
  enterFullName: string;
  enterRelation: string;
  enterBirthDate: string;
  enterMedication: string;
  enterDosage: string;
  selectFrequency: string;
  selectDuration: string;
  enterNotes: string;
  enterName: string;
  enterEmail: string;
}

export const translations: Record<Language, Translations> = {
  'pt-BR': {
    // Navegação
    home: 'Início',
    members: 'Membros',
    treatments: 'Tratamentos',
    chat: 'Chat',
    documents: 'Documentos',
    profile: 'Perfil',
    settings: 'Configurações',
    dossier: 'Dossiê',

    // Menu Drawer
    addMember: 'Cadastrar Membro',
    newTreatment: 'Novo Tratamento',
    documentAnalysis: 'Análise de Documentos',
    memberDetails: 'Detalhes do Membro',
    editMember: 'Editar Membro',
    memberDossier: 'Dossiê do Membro',
    treatmentDetails: 'Detalhes do Tratamento',
    intelligentChat: 'Chat Inteligente',
    logout: 'Sair',
    loading: 'Carregando...',
    defaultUserName: 'Nome do Usuário',

    // Tela Principal
    todayAgenda: 'Agenda de Hoje',
    familyMembers: 'Membros da Família',
    noTreatmentsToday: 'Nenhum tratamento agendado para hoje',
    noMembers: 'Nenhum membro cadastrado',
    viewAll: 'Ver Todos',

    // Membros
    addNewMember: 'Novo Membro',
    fullName: 'Nome Completo',
    relation: 'Relação',
    birthDate: 'Data de Nascimento',
    notes: 'Observações',
    additionalInfo: 'Informações adicionais...',
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    view: 'Visualizar',
    complete: 'Concluir',
    touchToAddPhoto: 'Toque para adicionar foto',
    touchToChangePhoto: 'Toque para alterar foto',

    // Tratamentos
    addTreatment: 'Novo Tratamento',
    editTreatment: 'Editar Tratamento',
    medication: 'Medicamento',
    dosage: 'Dosagem',
    frequency: 'Frequência',
    duration: 'Duração',
    startDate: 'Data de Início',
    startTime: 'Horário de Início',
    status: 'Status',
    active: 'Ativo',
    completed: 'Concluído',
    paused: 'Pausado',
    allTreatments: 'Todos os Tratamentos',
    description: 'Descrição',
    actions: 'Ações',
    confirmDelete: 'Confirmar Exclusão',
    deleteTreatmentConfirm: 'Tem certeza que deseja excluir este tratamento?',
    yes: 'Sim',
    no: 'Não',

    // Dossiê
    medicalDossier: 'Dossiê Médico',
    selectMemberDossier: 'Selecione um membro para visualizar seu dossiê completo',
    noMembersFound: 'Nenhum membro encontrado',
    addFamilyMembers: 'Adicione membros da família para gerar seus dossiês médicos',
    loadingMembers: 'Carregando membros...',

    // Configurações
    general: 'Geral',
    language: 'Idioma',
    notifications: 'Notificações',
    darkTheme: 'Tema Escuro',
    information: 'Informações',
    aboutApp: 'Sobre o App',
    privacyPolicy: 'Política de Privacidade',
    portuguese: 'Português (Brasil)',
    english: 'English',

    // Perfil
    userProfile: 'Perfil do Usuário',
    name: 'Nome',
    email: 'E-mail',
    updateProfile: 'Atualizar Perfil',

    // Chat
    intelligentChat: 'Chat Inteligente',
    documentAnalysis: 'Análise de Documentos',

    // Mensagens
    success: 'Sucesso',
    error: 'Erro',
    memberAddedSuccess: 'Membro adicionado com sucesso!',
    memberUpdatedSuccess: 'Membro atualizado com sucesso!',
    memberDeletedSuccess: 'Membro excluído com sucesso!',
    treatmentAddedSuccess: 'Tratamento adicionado com sucesso!',
    treatmentUpdatedSuccess: 'Tratamento atualizado com sucesso!',
    treatmentDeletedSuccess: 'Tratamento excluído com sucesso!',
    profileUpdatedSuccess: 'Perfil atualizado com sucesso!',
    requiredFields: 'Campos obrigatórios',
    nameAndRelationRequired: 'Nome e relação são obrigatórios',
    errorLoadingData: 'Erro ao carregar dados',
    errorSavingData: 'Erro ao salvar dados',
    errorDeletingData: 'Erro ao excluir dados',

    // Placeholders
    enterFullName: 'Digite o nome completo',
    enterRelation: 'Ex: Pai, Mãe, Filho, etc.',
    enterBirthDate: 'DD/MM/AAAA',
    enterMedication: 'Digite o nome do medicamento',
    enterDosage: 'Digite a dosagem',
    selectFrequency: 'Selecione a frequência',
    selectDuration: 'Selecione a duração',
    enterNotes: 'Digite observações',
    enterName: 'Digite seu nome',
    enterEmail: 'Digite seu e-mail',
  },
  'en': {
    // Navigation
    home: 'Home',
    members: 'Members',
    treatments: 'Treatments',
    chat: 'Chat',
    documents: 'Documents',
    profile: 'Profile',
    settings: 'Settings',
    dossier: 'Dossier',

    // Menu Drawer
    addMember: 'Add Member',
    newTreatment: 'New Treatment',
    documentAnalysis: 'Document Analysis',
    memberDetails: 'Member Details',
    editMember: 'Edit Member',
    memberDossier: 'Member Dossier',
    treatmentDetails: 'Treatment Details',
    intelligentChat: 'Intelligent Chat',
    logout: 'Logout',
    loading: 'Loading...',
    defaultUserName: 'User Name',

    // Main Screen
    todayAgenda: "Today's Agenda",
    familyMembers: 'Family Members',
    noTreatmentsToday: 'No treatments scheduled for today',
    noMembers: 'No members registered',
    viewAll: 'View All',

    // Members
    addNewMember: 'New Member',
    fullName: 'Full Name',
    relation: 'Relation',
    birthDate: 'Birth Date',
    notes: 'Notes',
    additionalInfo: 'Additional information...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    complete: 'Complete',
    touchToAddPhoto: 'Tap to add photo',
    touchToChangePhoto: 'Tap to change photo',

    // Treatments
    addTreatment: 'New Treatment',
    editTreatment: 'Edit Treatment',
    treatmentDetails: 'Treatment Details',
    medication: 'Medication',
    dosage: 'Dosage',
    frequency: 'Frequency',
    duration: 'Duration',
    startDate: 'Start Date',
    startTime: 'Start Time',
    status: 'Status',
    active: 'Active',
    completed: 'Completed',
    paused: 'Paused',
    allTreatments: 'All Treatments',
    description: 'Description',
    actions: 'Actions',
    confirmDelete: 'Confirm Delete',
    deleteTreatmentConfirm: 'Are you sure you want to delete this treatment?',
    yes: 'Yes',
    no: 'No',

    // Dossier
    medicalDossier: 'Medical Dossier',
    selectMemberDossier: 'Select a member to view their complete dossier',
    memberDossier: 'Member Dossier',
    noMembersFound: 'No members found',
    addFamilyMembers: 'Add family members to generate their medical dossiers',
    loadingMembers: 'Loading members...',

    // Settings
    general: 'General',
    language: 'Language',
    notifications: 'Notifications',
    darkTheme: 'Dark Theme',
    information: 'Information',
    aboutApp: 'About App',
    privacyPolicy: 'Privacy Policy',
    logout: 'Logout',
    portuguese: 'Português (Brasil)',
    english: 'English',

    // Profile
    userProfile: 'User Profile',
    name: 'Name',
    email: 'Email',
    updateProfile: 'Update Profile',

    // Chat
    intelligentChat: 'Intelligent Chat',
    documentAnalysis: 'Document Analysis',

    // Messages
    success: 'Success',
    error: 'Error',
    memberAddedSuccess: 'Member added successfully!',
    memberUpdatedSuccess: 'Member updated successfully!',
    memberDeletedSuccess: 'Member deleted successfully!',
    treatmentAddedSuccess: 'Treatment added successfully!',
    treatmentUpdatedSuccess: 'Treatment updated successfully!',
    treatmentDeletedSuccess: 'Treatment deleted successfully!',
    profileUpdatedSuccess: 'Profile updated successfully!',
    requiredFields: 'Required fields',
    nameAndRelationRequired: 'Name and relation are required',
    errorLoadingData: 'Error loading data',
    errorSavingData: 'Error saving data',
    errorDeletingData: 'Error deleting data',

    // Placeholders
    enterFullName: 'Enter full name',
    enterRelation: 'Ex: Father, Mother, Son, etc.',
    enterBirthDate: 'MM/DD/YYYY',
    enterMedication: 'Enter medication name',
    enterDosage: 'Enter dosage',
    selectFrequency: 'Select frequency',
    selectDuration: 'Select duration',
    enterNotes: 'Enter notes',
    enterName: 'Enter your name',
    enterEmail: 'Enter your email',
  },
}; 