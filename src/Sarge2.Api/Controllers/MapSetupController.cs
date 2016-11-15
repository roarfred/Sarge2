using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Sarge.Maps;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Sarge2.Api.Controllers
{
    [Route("api/[controller]")]
    public class MapSetupController : Controller
    {
        // GET: api/values
        [HttpGet]
        public IEnumerable<MapSetup> Get()
        {
            throw new NotImplementedException();
        }

        // GET api/values/5
        [HttpGet("{map}/{paper}")]
        public MapSetup Get(string map, string paper)
        {
            var vMap = new MapSourceController().Get(map);
            return new MapSetup()
            {
                Map = vMap,
                PaperSize = new PaperSizeController().Get(paper),
                Margins = new System.Drawing.Printing.Margins(0, 0, 0, 0),
                ScaleAndTileSize = vMap.GetScales().Where(v => v.Scale == 50000).First(),
                Radius = 200,
                ShowCrossHair = true,
                ShowLatLonGrid = false,
                ShowUtmGrid = false
            };
        }

        // POST api/values
        [HttpPost]
        public void Post([FromBody]string value)
        {
            throw new NotImplementedException();
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
