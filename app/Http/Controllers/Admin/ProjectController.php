<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Module;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::withCount('users')->latest()->paginate(10);
        
        // Ensure enabledModules is properly cast as array for each project
        $projects->getCollection()->transform(function ($project) {
            $project->enabledModules = is_array($project->enabledModules) 
                ? $project->enabledModules 
                : (is_string($project->enabledModules) ? json_decode($project->enabledModules, true) : []);
            return $project;
        });
        
        return Inertia::render('Admin/Projects/Index', [
            'projects' => $projects
        ]);
    }

    public function create()
    {
        $modules = Module::select('id', 'name', 'identifier')->get();
        
        return Inertia::render('Admin/Projects/Create', [
            'modules' => $modules
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'identifier' => 'required|string|max:255|unique:projects',
            'enabledModules' => 'required|array',
        ]);

        Project::create($validated);

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project created successfully.');
    }

    public function edit($id)
    {
        $project = Project::findOrFail($id);
        $modules = Module::select('id', 'name', 'identifier')->get();
        
        // Ensure enabledModules is properly cast as array
        $enabledModules = is_array($project->enabledModules) 
            ? $project->enabledModules 
            : (is_string($project->enabledModules) ? json_decode($project->enabledModules, true) : []);
        
        return Inertia::render('Admin/Projects/Edit', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'identifier' => $project->identifier,
                'enabledModules' => $enabledModules,
            ],
            'modules' => $modules
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'identifier' => 'required|string|max:255|unique:projects,identifier,' . $project->id,
            'enabledModules' => 'required|array',
        ]);

        $project->update($validated);

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project updated successfully.');
    }

    public function destroy($id)
    {
        $project = Project::findOrFail($id);

        if ($project->users()->count() > 0) {
            return redirect()->route('admin.projects.index')
                ->with('error', 'Cannot delete project with associated users. Please remove all users first.');
        }

        $project->delete();

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project deleted successfully.');
    }
} 