using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.IO;

namespace Sarge2.Api
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Add framework services.
            services.AddCors();
            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            //app.UseMvc(config =>
            //{
            //    config.MapRoute("Default", "{controller}/{action}/{id?}",
            //        new { controller = "Home", action = "Index" });
            //});

            // Let all requests direct to root, for SPA to catch all urls
            app.Use(async (c, next) =>
            {
                await next();

                if (c.Response.StatusCode == 404 && !Path.HasExtension(c.Request.Path.Value))
                {
                    c.Request.Path = "/index.html";
                    await next();
                }
            });

            // Cors must appear before the UseMvc to have any effect
            app.UseCors(config =>
            {
                config
                    //.WithOrigins(new[] {"http://localhost"})
                    .AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowCredentials()
                    .AllowAnyHeader();
            });

            // Please note the order of these
            app
                .UseMvc()
                .UseDefaultFiles()
                .UseStaticFiles();
        }
    }
}
