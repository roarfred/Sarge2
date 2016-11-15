﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Sarge.Maps;
using System.IO;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Sarge2.Api.Controllers
{
    [Route("api/[controller]")]
    public class MapAsPdfController : Controller
    {
        // GET: api/values
        [HttpGet]
        public IEnumerable<string> Get()
        {
            throw new NotImplementedException();
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            throw new NotImplementedException();
        }

        // POST api/values
        [HttpPost("{title}")]
        public async Task<FileStreamResult> Post(string title, [FromBody]MapSetup setup)
        {
            MapLoader vLoader = new MapLoader(setup);
            vLoader.PositionUtm32 = new UtmPosition(317206, 6692784);
            using (var vBitmap = await vLoader.CreateBitmapForPrintAsync())
            {
                var vStream = new MemoryStream();
                await vLoader.CreatePDFWithSpireAsync(vBitmap, title, null, vStream);
                vStream.Position = 0;
                return new FileStreamResult(vStream, "binary/pdf");
            }
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
            throw new NotImplementedException();
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
            throw new NotImplementedException();
        }
    }
}
