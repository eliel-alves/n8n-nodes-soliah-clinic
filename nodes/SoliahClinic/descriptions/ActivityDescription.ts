import { INodeProperties } from 'n8n-workflow';

const ACTIVITY_TYPE_OPTIONS = [
	{ name: 'Ligação', value: 'call' },
	{ name: 'WhatsApp', value: 'whatsapp' },
	{ name: 'E-mail', value: 'email' },
	{ name: 'Reunião', value: 'meeting' },
	{ name: 'Tarefa', value: 'task' },
	{ name: 'Follow-up', value: 'follow_up' },
	{ name: 'Nota', value: 'note' },
];

export const activityOperations: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['activity'] } },
		options: [
			{ name: 'Criar', value: 'create', description: 'Cria uma atividade numa negociação', action: 'Criar uma atividade' },
			{ name: 'Obter Vários', value: 'getAll', description: 'Lista as atividades de uma negociação', action: 'Obter atividades' },
			{ name: 'Atualizar', value: 'update', description: 'Atualiza uma atividade', action: 'Atualizar uma atividade' },
			{ name: 'Definir Status', value: 'setStatus', description: 'Conclui ou reabre uma atividade', action: 'Definir status da atividade' },
		],
		default: 'create',
	},
];

export const activityFields: INodeProperties[] = [
	{
		displayName: 'ID Da Negociação',
		name: 'dealId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['activity'], operation: ['create', 'getAll'] } },
		default: '',
		description: 'A negociação à qual a atividade pertence',
	},
	{
		displayName: 'ID Da Atividade',
		name: 'activityId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['activity'], operation: ['update', 'setStatus'] } },
		default: '',
	},
	{
		displayName: 'Tipo',
		name: 'activity_type',
		type: 'options',
		options: ACTIVITY_TYPE_OPTIONS,
		required: true,
		displayOptions: { show: { resource: ['activity'], operation: ['create'] } },
		default: 'follow_up',
	},
	{
		displayName: 'Título',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['activity'], operation: ['create'] } },
		default: '',
	},
	{
		displayName: 'Vencimento',
		name: 'due_at',
		type: 'dateTime',
		displayOptions: { show: { resource: ['activity'], operation: ['create'] } },
		default: '',
		description: 'Data/hora de vencimento (ISO 8601). Obrigatório para tipos diferentes de "Nota".',
	},
	{
		displayName: 'Campos Adicionais',
		name: 'activityAdditionalFields',
		type: 'collection',
		placeholder: 'Adicionar campo',
		default: {},
		displayOptions: { show: { resource: ['activity'], operation: ['create'] } },
		options: [
			{ displayName: 'Descrição', name: 'description', type: 'string', typeOptions: { rows: 3 }, default: '' },
			{ displayName: 'Responsável', name: 'responsavel_profile_id', type: 'options', typeOptions: { loadOptionsMethod: 'getOwners' }, default: '', description: 'Default: owner do token' },
		],
	},
	{
		displayName: 'Campos A Atualizar',
		name: 'activityUpdateFields',
		type: 'collection',
		placeholder: 'Adicionar campo',
		default: {},
		displayOptions: { show: { resource: ['activity'], operation: ['update'] } },
		options: [
			{ displayName: 'Título', name: 'title', type: 'string', default: '' },
			{ displayName: 'Descrição', name: 'description', type: 'string', typeOptions: { rows: 3 }, default: '' },
			{ displayName: 'Vencimento', name: 'due_at', type: 'dateTime', default: '' },
			{ displayName: 'Tipo', name: 'activity_type', type: 'options', options: ACTIVITY_TYPE_OPTIONS, default: 'follow_up' },
		],
	},
	{
		displayName: 'Concluída',
		name: 'completed',
		type: 'boolean',
		required: true,
		displayOptions: { show: { resource: ['activity'], operation: ['setStatus'] } },
		default: true,
		description: 'Whether the activity is completed (true) or reopened (false)',
	},
];
