import { Component } from '@angular/core';
import { TestBed, inject, ComponentFixture } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { Angulartics2, Angulartics2Module } from 'angulartics2';
import { Observable } from 'rxjs/Rx';

import { AgencyService } from '../../../services/agency';
import { ExternalLinkDirective } from '../../../directives/external-link';
import { RepoComponent } from './index';
import { ReposService } from '../../../services/repos';
import { SeoService } from '../../../services/seo';
import { LanguageIconPipe } from './../../../pipes/language-icon/language-icon.pipe';
import { TruncatePipe } from './../../../pipes/truncate/truncate.pipe';
import { ModalComponent } from './../../modal/modal.component';
import { ActivityListComponent } from './../activity-list/activity-list.component';
import { ModalService } from './../../../services/modal/modal.service';
import { IsDefinedPipe } from './../../../pipes/is-defined/is-defined.pipe';

// set test repository id used throughout to Dept of Veterans Affairs
let id = '33202667';

/**
 * Unit tests for RepoComponent.
 *
 */
describe('RepoComponent', () => {
  let fixture: ComponentFixture<RepoComponent>;
  let repoComponent: RepoComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        Angulartics2Module.forRoot(),
        CommonModule,
        HttpModule,
        // This hack is needed because there is a routerLink in the template
        RouterTestingModule.withRoutes([
         { path: 'explore-code/agencies/:id', component: DummyRoutingComponent }
        ])
      ],
      declarations: [
        ExternalLinkDirective,
        LanguageIconPipe,
        TruncatePipe,
        ActivityListComponent,
        ModalComponent,
        RepoComponent,
        DummyRoutingComponent,
        IsDefinedPipe
      ],
      providers: [
        AgencyService,
        Angulartics2,
        ReposService,
        ModalService,
        SeoService,
        { provide: ActivatedRoute, useClass: MockActivatedRoute }
      ]
    });

    fixture = TestBed.createComponent(RepoComponent);
    repoComponent = fixture.componentInstance;

  });

  it('should initialize repo property when getJsonagency.id property is set',
    inject([AgencyService, ReposService],
      (agencyService, reposService)  => {
    // setup dependencies
    let agency = {id: 'VA', name: 'Department of Veterans Affairs'};
    spyOn(agencyService, 'getAgency').and.returnValue(agency);
    let repo = createRepository({name: 'Fake repo name'});
    spyOn(reposService, 'getJsonFile').and.returnValue(Observable.of(repo));

    fixture.detectChanges();

    expect(repoComponent.repo).toBeDefined();
    // also checking on agency object after call to AgencyService.getAgancy()
    expect(repoComponent.repo.agency.id).toEqual(agency.id);
    // console.log("Agency: ", repoComponent.repo.agency);
  }));

  it('should NOT initialize repo property if id property is bogus',
    inject([AgencyService, ReposService],
      (agencyService, reposService)  => {
    let agency = {id: 'VA', name: 'Department of Veterans Affairs'};
    spyOn(agencyService, 'getAgency').and.returnValue(agency);
    let repos = undefined;
    spyOn(reposService, 'getJsonFile').and.returnValue(Observable.of(repos));
    // instantiate a new RepoComponent so that ngOnInit() doesn't get called
    let newRepoComponent = new RepoComponent(null, agencyService, reposService, null);

    // call getRepo() that invokes reposService.getJsonFile()
    newRepoComponent.getRepo('');

    expect(newRepoComponent.repo).toBeUndefined();
  }));

  it('should call seoService.setMetaDescription() when repository is returned ' +
    ' when reposService.getJsonFile() returns a repository' ,
    inject([AgencyService, ReposService, SeoService],
      (agencyService, reposService, seoService)  => {
    let agency = {id: 'VA', name: 'Department of Veterans Affairs'};
    spyOn(agencyService, 'getAgency').and.returnValue(agency);
    let repo = createRepository({name: 'Another Fake repo name'});
    spyOn(reposService, 'getJsonFile').and.returnValue(Observable.of(repo));
    spyOn(seoService, 'setMetaDescription');
    fixture.detectChanges();

    expect(repoComponent.repo).toBeDefined();
    expect(seoService.setMetaDescription).toHaveBeenCalled();
  }));

/******* Test repo.repository  ****/


  it('should display repository in template if repo.repository property is set',
    inject([AgencyService, ReposService, SeoService],
      (agencyService, reposService, seoService)  => {
    let agency = {id: 'VA', name: 'Department of Veterans Affairs'};
    spyOn(agencyService, 'getAgency').and.returnValue(agency);
    const repository = 'http://www.github.com/repository/';
    let repo = createRepository({
      name: 'A Fake repo name to show repo',
      repository: repository,
      homepage: 'http://code.gov/homepage/',
      openSourceProject: 1,
      governmentWideReuseProject:0
      
    });
    spyOn(reposService, 'getJsonFile').and.returnValue(Observable.of(repo));

    fixture.detectChanges();

    let anchors = fixture.nativeElement.querySelectorAll('.usa-button');
    // console.log('Anchors: ', anchors);

    // 2nd child anchor is the repository (first one is homepage)
    //console.log(anchors);
    console.log("anchor 0"+ anchors[0].href);
    //console.log("anchor 1"+ anchors[1].href);
    
    
    expect(anchors[1].href).toBe(repository);
  }));

  it('should display repository name in template if repo.name property is defined',
    inject([AgencyService, ReposService, SeoService],
      (agencyService, reposService, seoService)  => {
        setupRepoPropertyTest(agencyService, reposService, seoService,
          {name: 'VA REPO'});

        fixture.detectChanges();

        let el = fixture.nativeElement.querySelector('h1');
        // expect name to be disolayed
        expect(el.textContent).toBeDefined();
      }
  ));

/******* Test repo.description  ****/

  it('should NOT display repository description in template if repo.description '
    + 'property is undefined',
    inject([AgencyService, ReposService, SeoService],
      (agencyService, reposService, seoService)  => {
        setupRepoPropertyTest(agencyService, reposService, seoService,
          {description: undefined});

        fixture.detectChanges();

        let div = fixture.nativeElement.querySelector('.repo-header-container');
        expect(div.children[2]).toBeUndefined();
      }
  ));


  it('should NOT display repository description in template if repo.description property is null',
    inject([AgencyService, ReposService, SeoService],
      (agencyService, reposService, seoService)  => {
        setupRepoPropertyTest(agencyService, reposService, seoService,
          {description: null});

        fixture.detectChanges();

        let div = fixture.nativeElement.querySelector('.repo-header-container');
        expect(div.children[2]).toBeUndefined();
      }
  ));

  it('should display repository description in template if repo.description property is defined',
    inject([AgencyService, ReposService, SeoService],
      (agencyService, reposService, seoService)  => {
        setupRepoPropertyTest(agencyService, reposService, seoService,
          {description: 'REPO DESC'});

        fixture.detectChanges();

        let div = fixture.nativeElement.querySelector('.repo-header-container');
        expect(div.children[2]).toBeDefined();
      }
  ));


/******* Test repo.homepage  ****/

  it('should NOT display repository homepage in template if repo.homepage property is undefined',
    inject([AgencyService, ReposService, SeoService],
      (agencyService, reposService, seoService)  => {
        setupRepoPropertyTest(agencyService, reposService, seoService,

          {homepage: undefined}
          );


        fixture.detectChanges();

        let anchors = fixture.nativeElement.querySelectorAll('.usa-unstyled-list .usa-button');
        expect(anchors[0]).toBeUndefined();
        
      }
  ));

  it('should NOT display repository homepage in template if repo.homepage property is null ',
    inject([AgencyService, ReposService, SeoService],
      (agencyService, reposService, seoService)  => {
        setupRepoPropertyTest(agencyService, reposService, seoService,
          {homepage: null});

        fixture.detectChanges();
        
        let anchors = fixture.nativeElement.querySelectorAll('.usa-unstyled-list .usa-button');
        expect(anchors[0]).toBeUndefined();
      }
  ));

  it('should display repository homepage in template if repo.homepage property is defined',
    inject([AgencyService, ReposService, SeoService],
      (agencyService, reposService, seoService)  => {
        setupRepoPropertyTest(agencyService, reposService, seoService,

          {homepage: 'http://code.gov/', openSourceProject: 1});


        fixture.detectChanges();

     let parent = fixture.nativeElement.querySelectorAll('.usa-unstyled-list .usa-button');
     
     console.log("homepage is defined test: "+parent);
  
      expect(parent).toBeDefined();

      }
  ));

  describe('ngOnDestroy()', () => {
    it('should unsubscribe from router event subscription on destroy', () => {
      fixture.detectChanges();
      spyOn(repoComponent.eventSub, 'unsubscribe');
      fixture.destroy();
      expect(repoComponent.eventSub.unsubscribe).toHaveBeenCalled();
    });
  });

});

/**
 * Interface for repository properties that we are testing.
 * All properties are optional since we are teasting each one in isolation.
 */
interface RepoProps {
  name?: string;
  description?: string;
  homepage?: string;

  repository?: string;
  openSourceProject?: number;
  governmentWideReuseProject?: number;
  
}

/**
 *  Creates and populate a repository object for use in tests
 * using the RepoProps interface for type safety.
 */
export function createRepository(repoProps: RepoProps) {
  return {
      repos: [
        { repoID : id, name: repoProps.name, description: repoProps.description,
          codeLanguage: [{language: 'JavaScript'}], agency: 'VA',
          homepage: repoProps.homepage, repository: repoProps.repository,
          openSourceProject: repoProps.openSourceProject, governmentWideReuseProject: repoProps.governmentWideReuseProject}
        ]
    };
}

/**
 * Sets up a test of repository properties, by creating agency
 * and repostory data structures in addition to mocking
 * RepoComponent dependencies.
 */
export function setupRepoPropertyTest(
  agencyService: AgencyService, reposService: ReposService,
  seoService: SeoService, repoProps: RepoProps) {
    let agency = {id: 'VA', name: 'Department of Veterans Affairs'};
    spyOn(agencyService, 'getAgency').and.returnValue(agency);
    // set up repository
    const FAKE_REPO = createRepository(repoProps);
    spyOn(reposService, 'getJsonFile').and.returnValue(Observable.of(FAKE_REPO));

}

/**
 * Mock route
 */
class MockActivatedRoute extends ActivatedRoute {
  constructor() {
    super();
    this.params = Observable.of({id: id});
  }
}

@Component({
  template: ''
})
class DummyRoutingComponent {
}
