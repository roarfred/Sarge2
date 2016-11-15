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
    public class MapSourceController : Controller
    {
        // GET: api/values
        [HttpGet]
        public IEnumerable<WmsMap> Get()
        {
            return WmsMap.CreateMaps();
        }

        // GET api/values/5
        [HttpGet("{name}")]
        public WmsMap Get(string name)
        {
            return WmsMap.CreateMaps().FirstOrDefault(v=>v.Name == name);
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
