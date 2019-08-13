﻿using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using GradePortalAPI.Dtos;
using GradePortalAPI.Helpers;
using GradePortalAPI.Models;
using GradePortalAPI.Models.Interfaces;
using GradePortalAPI.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace GradePortalAPI.Controllers
{
    //[Authorize]
    [Route("[controller]/[action]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppSettings _appSettings;
        private readonly IMapper _mapper;
        private readonly IUserService _userService;
        private readonly ISkillService _skillService;
        private readonly IEvaluateService _evaluateService;

        public UsersController(
            IUserService userService,
            IMapper mapper,
            IOptions<AppSettings> appSettings,
            ISkillService skillService,
            IEvaluateService evaluateService
        )
        {
            _userService = userService ?? throw new ArgumentNullException(nameof(userService)); 
            _skillService = skillService ?? throw new ArgumentNullException(nameof(userService));
            _evaluateService = evaluateService ?? throw new ArgumentNullException(nameof(userService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _appSettings = appSettings.Value ?? throw new ArgumentNullException(nameof(appSettings)); 
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult Authenticate([FromBody] UserAuthDto userAuthDto)
        {
            try
            {
                var user = _userService.Authenticate(userAuthDto.Username, userAuthDto.Password);
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_appSettings.Secret);
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.Name, user.Id.ToString())
                    }),
                    Expires = DateTime.UtcNow.AddDays(1),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                        SecurityAlgorithms.HmacSha256Signature)
                };
                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenToSend = tokenHandler.WriteToken(token);

                return Ok(new UserAuthenticateModel
                {
                    Id = user.Id,
                    Username = user.Username,
                    Token = tokenToSend
                });
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult Register([FromBody] UserAuthDto userAuthDto)
        {
            var user = _mapper.Map<User>(userAuthDto);

            try
            {
                _userService.Create(user, userAuthDto.Password);
                return Ok();
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var users = _userService.GetAll();
            var userViewModels = _mapper.Map<IList<UserViewModel>>(users);
            return Ok(userViewModels);
        }

        [HttpGet("{username}")]
        public IActionResult GetByUsername(string username)
        {
            var user = _userService.GetByUserName(username);
            var userViewModel = _mapper.Map<UserViewModel>(user);

            var skills = _skillService.GetUserSkills(user.Id);
            var skillsDto = _mapper.Map<IList<SkillDto>>(skills);

            foreach (var skill in skillsDto)
            {
                var avEval = _evaluateService.GetAverageEvaluate(skill.Id, user.Id);
                skill.AverageEvaluate = avEval;
            }

            var userInfo = new UserSkillsDto()
            {
                UserData = userViewModel,
                Skills = skillsDto
            };

            return Ok(userInfo);
        }

        [HttpGet("{id}")]
        public IActionResult Get(string id)
        {
            var user = _userService.GetById(id);
            var userViewModel = _mapper.Map<UserViewModel>(user);
            return Ok(userViewModel);
        }

        [HttpPut]
        public IActionResult Update([FromBody] UserAuthDto userAuthDto)
        {
            var user = _mapper.Map<User>(userAuthDto);

            try
            {
                _userService.Update(user, userAuthDto.Password);
                return Ok();
            }
            catch (AppException e)
            {
                return BadRequest(new {message = e.Message});
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _userService.Delete(id);
            return Ok();
        }

        //[HttpPost]
        //public IActionResult AddUserSkill(string id, Skill skill)
        //{
        //    var user = _userService.GetById(id);
        //    var isExisted = _userService.IsExisted(skill);
        //    return Ok();
        //}
    }
}