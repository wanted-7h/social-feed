import { createRoute, z } from "hono_zod_openapi"
import { errorJson, idSchema, openApiJson } from "../utils.ts"
import { postingSchema } from "../schemas.ts"

// TODO: 상세조회를 위해 남겨두었으나 필요없으면 삭제 요망
export const postingRoute = createRoute({
	method: "get",
	path: "/postings/detail/{id}",
	tags: ["postings"],
	summary: "게시물 하나를 조회합니다.",
	request: {
		params: z.object({
			id: idSchema.openapi({
				param: { name: "id", in: "path", required: true },
				minimum: 1,
				example: 1,
			}),
		}),
	},
	responses: {
		200: {
			description: "성공적으로 게시물 조회 완료",
			...openApiJson(postingSchema.openapi({
				example: {
					id: 1,
					type: "facebook",
					title: "안녕하세요",
					content: "예시 컨텐츠 내용",
					content_id: "_wm_hiQF0lF5FSpZY8Afb",
					view_count: 1832,
					like_count: 363,
					share_count: 4,
					updated_at: "2023-02-11T11:58:16.080Z",
					created_at: "2023-01-28T18:05:35.518Z",
					user_id: 2,
				},
			})),
		},
		404: {
			description: "해당 게시물이 존재하지 않습니다.",
			...errorJson(z.string().openapi({ example: "Not Found" })),
		},
	},
})

export type PostingResponse = z.infer<typeof postingResponse>
const postingResponse = postingSchema
	.pick({
		type: true,
		title: true,
		content: true,
		view_count: true,
		like_count: true,
		share_count: true,
		updated_at: true,
		created_at: true,
	})
	.extend({ hashtags: z.string().array() })
	.openapi({
		example: {
			type: "facebook",
			title: "안녕하세요...",
			content: "예시 컨텐츠 내용...",
			view_count: 1832,
			like_count: 363,
			share_count: 4,
			updated_at: "2023-02-11T11:58:16.080Z",
			created_at: "2023-01-28T18:05:35.518Z",
			hashtags: ["h1", "h2", "h3"],
		},
	})

export const postingListRoute = createRoute({
	method: "get",
	path: "/postings/list",
	tags: ["postings"],
	summary: "게시물 목록 조회합니다.",
	request: {
		query: z.object({
			hashtag: z.string().optional().openapi({ example: "online" }),
			type: z.enum(["facebook", "instagram", "twitter", "threads"]).optional()
				.openapi({ example: "twitter" }),
			order_by: z.enum(["created_at", "updated_at", "like_count", "share_count", "view_count"])
				.default("created_at"),
			sort: z.enum(["asc", "desc"]).default("desc"),
			search_by: z.enum(["title", "content", "title,content"]).default("title,content"),
			search: z.string().optional(),
			page_count: z.string().pipe(z.coerce.number().int()).default("10"),
			page: z.string().pipe(z.coerce.number().int()).default("0"),
		}),
	},
	responses: {
		200: {
			description: "성공적으로 게시물 목록 조회 완료",
			...openApiJson(z.array(postingResponse)),
		},
		404: {
			description: "해당 게시물이 존재하지 않습니다.",
			...errorJson(z.string().openapi({ example: "Not Found" })),
		},
	},
})

export const postingShareRoute = createRoute({
	method: "put",
	path: "/postings/share/{id}",
	tags: ["postings"],
	summary: "게시물을 공유합니다.",
	request: {
		params: z.object({
			id: idSchema.openapi({
				param: { name: "id", in: "path", required: true },
				minimum: 1,
				example: 1,
			}),
		}),
	},
	responses: {
		200: {
			description: "공유 성공",
			...openApiJson(
				z.object({ share_count: z.number().int() }).openapi({
					example: { share_count: 1 },
				}),
			),
		},
		404: {
			description: "해당 게시물이 존재하지 않습니다.",
			...errorJson(z.string().openapi({ example: "게시물이 없습니다" })),
		},
	},
})
