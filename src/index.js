import html from '../src/public/dash/index.html'
import upload from '../src/public/dash/upload.html'
import list from '../src/public/dash/list.html'
import instructions from '../src/public/dash/wiki.html'
import notfoundpage from '../src/public/dash/404.html'
import { corsHeaders, is_authorized } from './utils'
import { dumpCache, handleDeleteFile, handleFileList, handleGetFile, handleMultpleUploads, handlePutFile } from './handlers'
// MIME type mapping based on file extensions

const AUTH_REALM = 'BOOKO-DAV';

function handleStaticAssets(path) {
	// 处理 HTML 页面
	switch (path) {
		case "/":
			return {
				content: html,
				contentType: 'text/html; charset=utf-8'
			};
		case "/dav/upload":
			return {
				content: upload,
				contentType: 'text/html; charset=utf-8'
			};
		case "/dav/list":
			return {
				content: list,
				contentType: 'text/html; charset=utf-8'
			};
		case "/dav":
			return {
				content: instructions,
				contentType: 'text/html; charset=utf-8'
			};
		default:
			return {
				content: notfoundpage,
				contentType: 'text/html; charset=utf-8'
			};
	}
}

export default {
	async fetch(request, env, ctx) {
		const authorization_header = request.headers.get("Authorization") || "";
		const url = new URL(request.url);
		let path = url.pathname;

		// 处理静态资源
		if (request.method === "GET" && (path === "/" || path.startsWith("/dav"))) {
			const { content, contentType } = handleStaticAssets(path);
			
			// 添加 CORS 头，允许样式文件被跨域访问
			const headers = {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=604800",
				"Access-Control-Allow-Origin": "*",
			};
			
			return new Response(content, { headers });
		}

		if (request.method === "GET" && path === "/favicon.ico") {
			const favicon = './favicon.ico'
			if (!favicon) {
				return new Response("Favicon not found", { status: 404 });
			}
			return new Response(favicon.body, {
				headers: {
					"Content-Type": "image/x-icon",
					"Cache-Control": "public, max-age=604800"
				}
			});
		}

		// 对于非静态资源的请求，需要进行身份验证
		if (
			request.method !== "OPTIONS" &&
			!(await is_authorized(authorization_header, env.USERNAME, env.PASSWORD))
		) {
			return new Response("Unauthorized", {
				status: 401,
				headers: {
					"WWW-Authenticate": `Basic realm="${AUTH_REALM}"`,
				},
			});
		}

		if (request.method === "GET" && path === "/dumpcache") {
			return dumpCache(request, env, ctx);
		}

		if (request.method === "PUT") {
			return handlePutFile(request, env, ctx)
		}

		if (request.method === 'DELETE') {
			return handleDeleteFile(request, env, ctx);
		}

		if (request.method === "POST" && path === "/upload") {
			return handleMultpleUploads(request, env, ctx)
		}

		if (request.method === "GET") {
			return handleGetFile(request, env, ctx)
		}

		if (request.method === "PROPFIND") {
			return handleFileList(request, env, ctx)
		}

		return new Response("Method not allowed", { status: 405, headers: corsHeaders });
	},
};