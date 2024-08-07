/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	LatestSprintPointsView = "latest_sprint_points_view",
	LatestSprintSnapshotDateView = "latest_sprint_snapshot_date_view",
	SprintDatesView = "sprint_dates_view",
	SprintDevsView = "sprint_devs_view",
	Sprints = "sprints",
	SprintsPointsTbdView = "sprints_points_tbd_view",
	SprintsView = "sprints_view",
	Staffing = "staffing",
	Tickets = "tickets",
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

export type LatestSprintPointsViewRecord<Tcr_points = unknown, Tdone_points = unknown, Ttbd_points = unknown, Tto_val_points = unknown, Ttotal_points = unknown> = {
	cr_points?: null | Tcr_points
	date?: string
	done_points?: null | Tdone_points
	sprint?: string
	tbd_points?: null | Ttbd_points
	to_val_points?: null | Tto_val_points
	total_points?: null | Ttotal_points
}

export type LatestSprintSnapshotDateViewRecord<Tdate = unknown> = {
	date?: null | Tdate
	sprint?: string
}

export type SprintDatesViewRecord = {
	sprint?: string
	utc_date?: IsoDateString
}

export type SprintDevsViewRecord = {
	dev?: string
	sprint?: string
}

export type SprintsRecord = {
	fourth_track?: string
	is_code_freeze?: boolean
	name: string
	secondary_track?: string
	sprint_goal?: string
	third_track?: string
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

export type UsersRecord = {
	avatar?: string
	img?: string
	isAdmin?: boolean
	name?: string
}

// Response types include system fields and match responses from the PocketBase API
export type LatestSprintPointsViewResponse<Tcr_points = unknown, Tdone_points = unknown, Ttbd_points = unknown, Tto_val_points = unknown, Ttotal_points = unknown, Texpand = unknown> = Required<LatestSprintPointsViewRecord<Tcr_points, Tdone_points, Ttbd_points, Tto_val_points, Ttotal_points>> & BaseSystemFields<Texpand>
export type LatestSprintSnapshotDateViewResponse<Tdate = unknown, Texpand = unknown> = Required<LatestSprintSnapshotDateViewRecord<Tdate>> & BaseSystemFields<Texpand>
export type SprintDatesViewResponse<Texpand = unknown> = Required<SprintDatesViewRecord> & BaseSystemFields<Texpand>
export type SprintDevsViewResponse<Texpand = unknown> = Required<SprintDevsViewRecord> & BaseSystemFields<Texpand>
export type SprintsResponse<Texpand = unknown> = Required<SprintsRecord> & BaseSystemFields<Texpand>
export type SprintsPointsTbdViewResponse<Tendt_at = unknown, Tpoints = unknown, Tstart_at = unknown, Texpand = unknown> = Required<SprintsPointsTbdViewRecord<Tendt_at, Tpoints, Tstart_at>> & BaseSystemFields<Texpand>
export type SprintsViewResponse<Tdone_points = unknown, Ttbd_points = unknown, Tto_val_points = unknown, Ttotal_points = unknown, Texpand = unknown> = Required<SprintsViewRecord<Tdone_points, Ttbd_points, Tto_val_points, Ttotal_points>> & BaseSystemFields<Texpand>
export type StaffingResponse<Texpand = unknown> = Required<StaffingRecord> & BaseSystemFields<Texpand>
export type TicketsResponse<Tlabels = unknown, Tparents = unknown, Texpand = unknown> = Required<TicketsRecord<Tlabels, Tparents>> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	latest_sprint_points_view: LatestSprintPointsViewRecord
	latest_sprint_snapshot_date_view: LatestSprintSnapshotDateViewRecord
	sprint_dates_view: SprintDatesViewRecord
	sprint_devs_view: SprintDevsViewRecord
	sprints: SprintsRecord
	sprints_points_tbd_view: SprintsPointsTbdViewRecord
	sprints_view: SprintsViewRecord
	staffing: StaffingRecord
	tickets: TicketsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	latest_sprint_points_view: LatestSprintPointsViewResponse
	latest_sprint_snapshot_date_view: LatestSprintSnapshotDateViewResponse
	sprint_dates_view: SprintDatesViewResponse
	sprint_devs_view: SprintDevsViewResponse
	sprints: SprintsResponse
	sprints_points_tbd_view: SprintsPointsTbdViewResponse
	sprints_view: SprintsViewResponse
	staffing: StaffingResponse
	tickets: TicketsResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'latest_sprint_points_view'): RecordService<LatestSprintPointsViewResponse>
	collection(idOrName: 'latest_sprint_snapshot_date_view'): RecordService<LatestSprintSnapshotDateViewResponse>
	collection(idOrName: 'sprint_dates_view'): RecordService<SprintDatesViewResponse>
	collection(idOrName: 'sprint_devs_view'): RecordService<SprintDevsViewResponse>
	collection(idOrName: 'sprints'): RecordService<SprintsResponse>
	collection(idOrName: 'sprints_points_tbd_view'): RecordService<SprintsPointsTbdViewResponse>
	collection(idOrName: 'sprints_view'): RecordService<SprintsViewResponse>
	collection(idOrName: 'staffing'): RecordService<StaffingResponse>
	collection(idOrName: 'tickets'): RecordService<TicketsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
