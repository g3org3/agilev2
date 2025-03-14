/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Challenges = "challenges",
	Comments = "comments",
	Epics = "epics",
	Events = "events",
	Investigations = "investigations",
	InvestigationsBySprintView = "investigations_by_sprint_view",
	LatestSprintPointsView = "latest_sprint_points_view",
	LatestSprintSnapshotDateView = "latest_sprint_snapshot_date_view",
	Leaderboard = "leaderboard",
	Links = "links",
	MatchBets = "match_bets",
	Matches = "matches",
	Nextsteps = "nextsteps",
	Passkeys = "passkeys",
	Predictions = "predictions",
	Problems = "problems",
	Results = "results",
	Roadmap = "roadmap",
	SprintDatesView = "sprint_dates_view",
	SprintDevsView = "sprint_devs_view",
	Sprints = "sprints",
	SprintsLabelsView = "sprints_labels_view",
	SprintsPointsTbdView = "sprints_points_tbd_view",
	SprintsView = "sprints_view",
	Staffing = "staffing",
	Tickets = "tickets",
	Tournaments = "tournaments",
	Updates = "updates",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type ChallengesRecord = {
	challenge: string
	user_id: RecordIdString
}

export type CommentsRecord = {
	authorId?: RecordIdString
	eventId?: RecordIdString
	sample?: string
	text: string
}

export type EpicsRecord = {
	background?: string
	epic_key?: string
	estimated_ba?: number
	estimated_conception?: number
	estimated_design?: number
	estimated_dev?: number
	estimated_nfr?: number
	name?: string
	status?: string
}

export type EventsRecord = {
	authorId?: RecordIdString
	notes?: string
	sharedWith?: RecordIdString
	title: string
}

export enum InvestigationsInvStatusOptions {
	"ON_HOLD" = "ON_HOLD",
	"ON_GOING" = "ON_GOING",
	"DONE" = "DONE",
}
export type InvestigationsRecord = {
	date: string
	inv_status: InvestigationsInvStatusOptions
	key: string
	name: string
	owner?: string
	points?: number
	sprint: string
	status: string
	summary: string
}

export type InvestigationsBySprintViewRecord<Tinv_statuses = unknown, Tkeys = unknown, Towners = unknown, Ttotal_points = unknown> = {
	inv_statuses?: null | Tinv_statuses
	keys?: null | Tkeys
	name: string
	owners?: null | Towners
	total_points?: null | Ttotal_points
}

export type LatestSprintPointsViewRecord<Tcr_points = unknown, Tdone_points = unknown, Ttbd_points = unknown, Tto_val_points = unknown, Ttotal_points = unknown, Tvalidation_returns = unknown> = {
	cr_points?: null | Tcr_points
	date?: string
	done_points?: null | Tdone_points
	sprint?: string
	tbd_points?: null | Ttbd_points
	to_val_points?: null | Tto_val_points
	total_points?: null | Ttotal_points
	validation_returns?: null | Tvalidation_returns
}

export type LatestSprintSnapshotDateViewRecord<Tdate = unknown> = {
	date?: null | Tdate
	sprint?: string
}

export type LeaderboardRecord<Tpoints = unknown> = {
	points?: null | Tpoints
	tournament_id?: RecordIdString
	user?: RecordIdString
}

export type LinksRecord<Ttags = unknown> = {
	author?: RecordIdString
	desc?: string
	image?: string
	tags?: null | Ttags
	title?: string
	url?: string
}

export type MatchBetsRecord<Taway_per = unknown, Thome_per = unknown, Ttie_per = unknown> = {
	away_per?: null | Taway_per
	home_per?: null | Thome_per
	match_id?: RecordIdString
	tie_per?: null | Ttie_per
}

export type MatchesRecord = {
	away?: string
	awayScore?: number
	home?: string
	homeScore?: number
	location?: string
	matchNumber?: number
	roundNumber?: number
	startAtUtc?: IsoDateString
	tournament?: RecordIdString
}

export enum NextstepsTypeOptions {
	"doubt" = "doubt",
	"nextstep" = "nextstep",
}
export type NextstepsRecord = {
	authorId?: RecordIdString
	doneAt?: IsoDateString
	eventId?: RecordIdString
	remindAt?: IsoDateString
	title?: string
	type?: NextstepsTypeOptions
}

export enum PasskeysDeviceTypeOptions {
	"singleDevice" = "singleDevice",
	"multiDevice" = "multiDevice",
}
export type PasskeysRecord<Ttransports = unknown> = {
	backedUp: boolean
	counter?: number
	credentialId: string
	deviceType: PasskeysDeviceTypeOptions
	publicKey: string
	transports?: null | Ttransports
	user_id: RecordIdString
	webauthnUserID: string
}

export type PredictionsRecord = {
	awayScore?: number
	homeScore?: number
	match?: RecordIdString
	user?: RecordIdString
}

export type ProblemsRecord = {
	date?: string
	delayed_points?: number
	description?: string
	sprint?: string
	ticket?: string
}

export type ResultsRecord<Tpoints = unknown> = {
	away?: string
	awayScore?: number
	home?: string
	homeScore?: number
	match_id?: RecordIdString
	p_away?: number
	p_home?: number
	points?: null | Tpoints
	prediction_id?: RecordIdString
	startAtUtc?: IsoDateString
	tournament_id?: RecordIdString
	user?: RecordIdString
}

export type RoadmapRecord = {
	ac?: RecordIdString[]
	backlog?: RecordIdString[]
	briefing?: RecordIdString[]
	conception?: RecordIdString[]
	design?: RecordIdString[]
	dev?: RecordIdString[]
	done?: RecordIdString[]
	release?: string
	sprint?: string
	start_date?: string
}

export type SprintDatesViewRecord = {
	date?: string
	sprint?: string
	utc_date?: IsoDateString
}

export type SprintDevsViewRecord = {
	dev?: string
	sprint?: string
}

export type SprintsRecord = {
	date?: string
	fourth_track?: string
	is_code_freeze?: boolean
	name: string
	secondary_track?: string
	sprint_goal?: string
	third_track?: string
}

export type SprintsLabelsViewRecord<Tko_count = unknown, Tunderestimated_count = unknown, Tvalidation_return_count = unknown, Twrong_count = unknown> = {
	ko_count?: null | Tko_count
	sprint?: string
	total?: number
	underestimated_count?: null | Tunderestimated_count
	validation_return_count?: null | Tvalidation_return_count
	wrong_count?: null | Twrong_count
}

export type SprintsPointsTbdViewRecord<Tendt_at = unknown, Tpoints = unknown, Tstart_at = unknown> = {
	endt_at?: null | Tendt_at
	points?: null | Tpoints
	sprint?: string
	start_at?: null | Tstart_at
}

export type SprintsViewRecord<Tdone_points = unknown, Ttbd_points = unknown, Tto_val_points = unknown, Ttotal_points = unknown> = {
	date?: string
	done_points?: null | Tdone_points
	sprint?: string
	tbd_points?: null | Ttbd_points
	to_val_points?: null | Tto_val_points
	total_points?: null | Ttotal_points
}

export type StaffingRecord = {
	date?: string
	dev?: string
	points?: number
	sprint?: string
	utc_date?: IsoDateString
}

export type TicketsRecord<Tlabels = unknown, Tparents = unknown> = {
	date?: string
	description?: string
	epic?: string
	epic_name?: string
	fetched_at?: IsoDateString
	key?: string
	labels?: null | Tlabels
	owner?: string
	parents?: null | Tparents
	points?: number
	sprint?: string
	status?: string
	summary?: string
}

export type TournamentsRecord = {
	logo?: string
	name?: string
}

export type UpdatesRecord = {
	sprint?: string
}

export type UsersRecord = {
	avatar?: string
	img?: string
	isAdmin?: boolean
	name?: string
}

// Response types include system fields and match responses from the PocketBase API
export type ChallengesResponse<Texpand = unknown> = Required<ChallengesRecord> & BaseSystemFields<Texpand>
export type CommentsResponse<Texpand = unknown> = Required<CommentsRecord> & BaseSystemFields<Texpand>
export type EpicsResponse<Texpand = unknown> = Required<EpicsRecord> & BaseSystemFields<Texpand>
export type EventsResponse<Texpand = unknown> = Required<EventsRecord> & BaseSystemFields<Texpand>
export type InvestigationsResponse<Texpand = unknown> = Required<InvestigationsRecord> & BaseSystemFields<Texpand>
export type InvestigationsBySprintViewResponse<Tinv_statuses = unknown, Tkeys = unknown, Towners = unknown, Ttotal_points = unknown, Texpand = unknown> = Required<InvestigationsBySprintViewRecord<Tinv_statuses, Tkeys, Towners, Ttotal_points>> & BaseSystemFields<Texpand>
export type LatestSprintPointsViewResponse<Tcr_points = unknown, Tdone_points = unknown, Ttbd_points = unknown, Tto_val_points = unknown, Ttotal_points = unknown, Tvalidation_returns = unknown, Texpand = unknown> = Required<LatestSprintPointsViewRecord<Tcr_points, Tdone_points, Ttbd_points, Tto_val_points, Ttotal_points, Tvalidation_returns>> & BaseSystemFields<Texpand>
export type LatestSprintSnapshotDateViewResponse<Tdate = unknown, Texpand = unknown> = Required<LatestSprintSnapshotDateViewRecord<Tdate>> & BaseSystemFields<Texpand>
export type LeaderboardResponse<Tpoints = unknown, Texpand = unknown> = Required<LeaderboardRecord<Tpoints>> & BaseSystemFields<Texpand>
export type LinksResponse<Ttags = unknown, Texpand = unknown> = Required<LinksRecord<Ttags>> & BaseSystemFields<Texpand>
export type MatchBetsResponse<Taway_per = unknown, Thome_per = unknown, Ttie_per = unknown, Texpand = unknown> = Required<MatchBetsRecord<Taway_per, Thome_per, Ttie_per>> & BaseSystemFields<Texpand>
export type MatchesResponse<Texpand = unknown> = Required<MatchesRecord> & BaseSystemFields<Texpand>
export type NextstepsResponse<Texpand = unknown> = Required<NextstepsRecord> & BaseSystemFields<Texpand>
export type PasskeysResponse<Ttransports = unknown, Texpand = unknown> = Required<PasskeysRecord<Ttransports>> & BaseSystemFields<Texpand>
export type PredictionsResponse<Texpand = unknown> = Required<PredictionsRecord> & BaseSystemFields<Texpand>
export type ProblemsResponse<Texpand = unknown> = Required<ProblemsRecord> & BaseSystemFields<Texpand>
export type ResultsResponse<Tpoints = unknown, Texpand = unknown> = Required<ResultsRecord<Tpoints>> & BaseSystemFields<Texpand>
export type RoadmapResponse<Texpand = unknown> = Required<RoadmapRecord> & BaseSystemFields<Texpand>
export type SprintDatesViewResponse<Texpand = unknown> = Required<SprintDatesViewRecord> & BaseSystemFields<Texpand>
export type SprintDevsViewResponse<Texpand = unknown> = Required<SprintDevsViewRecord> & BaseSystemFields<Texpand>
export type SprintsResponse<Texpand = unknown> = Required<SprintsRecord> & BaseSystemFields<Texpand>
export type SprintsLabelsViewResponse<Tko_count = unknown, Tunderestimated_count = unknown, Tvalidation_return_count = unknown, Twrong_count = unknown, Texpand = unknown> = Required<SprintsLabelsViewRecord<Tko_count, Tunderestimated_count, Tvalidation_return_count, Twrong_count>> & BaseSystemFields<Texpand>
export type SprintsPointsTbdViewResponse<Tendt_at = unknown, Tpoints = unknown, Tstart_at = unknown, Texpand = unknown> = Required<SprintsPointsTbdViewRecord<Tendt_at, Tpoints, Tstart_at>> & BaseSystemFields<Texpand>
export type SprintsViewResponse<Tdone_points = unknown, Ttbd_points = unknown, Tto_val_points = unknown, Ttotal_points = unknown, Texpand = unknown> = Required<SprintsViewRecord<Tdone_points, Ttbd_points, Tto_val_points, Ttotal_points>> & BaseSystemFields<Texpand>
export type StaffingResponse<Texpand = unknown> = Required<StaffingRecord> & BaseSystemFields<Texpand>
export type TicketsResponse<Tlabels = unknown, Tparents = unknown, Texpand = unknown> = Required<TicketsRecord<Tlabels, Tparents>> & BaseSystemFields<Texpand>
export type TournamentsResponse<Texpand = unknown> = Required<TournamentsRecord> & BaseSystemFields<Texpand>
export type UpdatesResponse<Texpand = unknown> = Required<UpdatesRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	challenges: ChallengesRecord
	comments: CommentsRecord
	epics: EpicsRecord
	events: EventsRecord
	investigations: InvestigationsRecord
	investigations_by_sprint_view: InvestigationsBySprintViewRecord
	latest_sprint_points_view: LatestSprintPointsViewRecord
	latest_sprint_snapshot_date_view: LatestSprintSnapshotDateViewRecord
	leaderboard: LeaderboardRecord
	links: LinksRecord
	match_bets: MatchBetsRecord
	matches: MatchesRecord
	nextsteps: NextstepsRecord
	passkeys: PasskeysRecord
	predictions: PredictionsRecord
	problems: ProblemsRecord
	results: ResultsRecord
	roadmap: RoadmapRecord
	sprint_dates_view: SprintDatesViewRecord
	sprint_devs_view: SprintDevsViewRecord
	sprints: SprintsRecord
	sprints_labels_view: SprintsLabelsViewRecord
	sprints_points_tbd_view: SprintsPointsTbdViewRecord
	sprints_view: SprintsViewRecord
	staffing: StaffingRecord
	tickets: TicketsRecord
	tournaments: TournamentsRecord
	updates: UpdatesRecord
	users: UsersRecord
}

export type CollectionResponses = {
	challenges: ChallengesResponse
	comments: CommentsResponse
	epics: EpicsResponse
	events: EventsResponse
	investigations: InvestigationsResponse
	investigations_by_sprint_view: InvestigationsBySprintViewResponse
	latest_sprint_points_view: LatestSprintPointsViewResponse
	latest_sprint_snapshot_date_view: LatestSprintSnapshotDateViewResponse
	leaderboard: LeaderboardResponse
	links: LinksResponse
	match_bets: MatchBetsResponse
	matches: MatchesResponse
	nextsteps: NextstepsResponse
	passkeys: PasskeysResponse
	predictions: PredictionsResponse
	problems: ProblemsResponse
	results: ResultsResponse
	roadmap: RoadmapResponse
	sprint_dates_view: SprintDatesViewResponse
	sprint_devs_view: SprintDevsViewResponse
	sprints: SprintsResponse
	sprints_labels_view: SprintsLabelsViewResponse
	sprints_points_tbd_view: SprintsPointsTbdViewResponse
	sprints_view: SprintsViewResponse
	staffing: StaffingResponse
	tickets: TicketsResponse
	tournaments: TournamentsResponse
	updates: UpdatesResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'challenges'): RecordService<ChallengesResponse>
	collection(idOrName: 'comments'): RecordService<CommentsResponse>
	collection(idOrName: 'epics'): RecordService<EpicsResponse>
	collection(idOrName: 'events'): RecordService<EventsResponse>
	collection(idOrName: 'investigations'): RecordService<InvestigationsResponse>
	collection(idOrName: 'investigations_by_sprint_view'): RecordService<InvestigationsBySprintViewResponse>
	collection(idOrName: 'latest_sprint_points_view'): RecordService<LatestSprintPointsViewResponse>
	collection(idOrName: 'latest_sprint_snapshot_date_view'): RecordService<LatestSprintSnapshotDateViewResponse>
	collection(idOrName: 'leaderboard'): RecordService<LeaderboardResponse>
	collection(idOrName: 'links'): RecordService<LinksResponse>
	collection(idOrName: 'match_bets'): RecordService<MatchBetsResponse>
	collection(idOrName: 'matches'): RecordService<MatchesResponse>
	collection(idOrName: 'nextsteps'): RecordService<NextstepsResponse>
	collection(idOrName: 'passkeys'): RecordService<PasskeysResponse>
	collection(idOrName: 'predictions'): RecordService<PredictionsResponse>
	collection(idOrName: 'problems'): RecordService<ProblemsResponse>
	collection(idOrName: 'results'): RecordService<ResultsResponse>
	collection(idOrName: 'roadmap'): RecordService<RoadmapResponse>
	collection(idOrName: 'sprint_dates_view'): RecordService<SprintDatesViewResponse>
	collection(idOrName: 'sprint_devs_view'): RecordService<SprintDevsViewResponse>
	collection(idOrName: 'sprints'): RecordService<SprintsResponse>
	collection(idOrName: 'sprints_labels_view'): RecordService<SprintsLabelsViewResponse>
	collection(idOrName: 'sprints_points_tbd_view'): RecordService<SprintsPointsTbdViewResponse>
	collection(idOrName: 'sprints_view'): RecordService<SprintsViewResponse>
	collection(idOrName: 'staffing'): RecordService<StaffingResponse>
	collection(idOrName: 'tickets'): RecordService<TicketsResponse>
	collection(idOrName: 'tournaments'): RecordService<TournamentsResponse>
	collection(idOrName: 'updates'): RecordService<UpdatesResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
