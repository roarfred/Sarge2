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
    public class GetPaperCoordinatesController : Controller
    {
      

        // GET api/values/5
        [HttpPost()]
        public ActionResult Post([FromBody]MapSetup setup)
        {
            var vCoords = new
            {
                Paper = setup.GetPaperBounds(),
               // CrossHair = setup.GetCrossHairCoordinates()
            };
            return Ok(vCoords);
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
