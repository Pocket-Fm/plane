package routes

import (
	"context"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	prime_api "github.com/makeplane/plane-ee/monitor/lib/api"
	primelogger "github.com/makeplane/plane-ee/monitor/lib/logger"
	"github.com/makeplane/plane-ee/monitor/lib/router/handlers"
)

func RegisterFeatureFlags(router *fiber.Router, plogger *primelogger.Handler, api *prime_api.IPrimeMonitorApi, key string) {
	ffController := fiber.New()
	ffController.Use(logger.New(logger.Config{
		Output: dummyWriter{},
		Done: func(c *fiber.Ctx, logString []byte) {
			if c.Response().StatusCode() == fiber.StatusOK {
				plogger.Info(context.Background(), "[HTTP ROUTER] "+strings.ReplaceAll(string(logString), "\n", ""))
			} else {
				plogger.Error(context.Background(), "[HTTP ROUTER] "+strings.ReplaceAll(string(logString), "\n", ""))
			}
		},
	}))

	(*router).Mount("/", ffController)
	addFreeWorkspace(ffController, api, key)
	addActivateRoutes(ffController, api, key)
	addFeatureFlagRoutes(ffController, api, key)
	addSyncRoutes(ffController, api, key)
	addWorkspaceLicensRoutes(ffController, api, key)
	addWorkspaceProductRoutes(ffController, api, key)
}

func addFreeWorkspace(routes fiber.Router, api *prime_api.IPrimeMonitorApi, key string) {
	routes.Post("/licenses/initialize/", handlers.InitializeFreeWorkspace(*api, key))
}

func addActivateRoutes(controller *fiber.App, api *prime_api.IPrimeMonitorApi, key string) {
	controller.Post("/licenses/activate/", handlers.GetActivateFeatureFlagHandler(*api, key))
}

func addFeatureFlagRoutes(controller *fiber.App, api *prime_api.IPrimeMonitorApi, key string) {
	controller.Post("/feature-flags/", handlers.GetFeatureFlagHandler(*api, key))
}

func addSyncRoutes(controller *fiber.App, api *prime_api.IPrimeMonitorApi, key string) {
	controller.Patch("/workspaces/:workspaceId/subscriptions/", handlers.GetSyncFeatureFlagHandler(*api, key))
}

func addWorkspaceLicensRoutes(controller *fiber.App, api *prime_api.IPrimeMonitorApi, key string) {
	controller.Get("/workspaces/:workspaceId/licenses/", handlers.GetWorkspaceLicenseHandler(*api, key))
}

func addWorkspaceProductRoutes(controller *fiber.App, api *prime_api.IPrimeMonitorApi, key string) {
	controller.Post("/products/workspace-products/:workspaceId/", handlers.GetWorkspaceProductHandler(*api, key))
}

/*
Endpoints:
- POST /subscriptions/check/ { workspace_id: string } 200 | 400 - true/false
*/
