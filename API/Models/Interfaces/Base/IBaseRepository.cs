﻿using System.Threading.Tasks;

namespace GradePortalAPI.Models.Interfaces.Base
{
    public interface IBaseRepository<TEnity>
        where TEnity : class
    {
        Task<IResult<TEnity>> FindById(string id);
        Task<IResult> Delete(string id);
    }
}